import cache from 'memory-cache';

export const explorePopularRoutes = async (req, res) => {
  const { language } = req.params;
  const cacheKey = `popular_${language}`;

  try {
    // 1. Check cache
    const cachedRepos = cache.get(cacheKey);
    if (cachedRepos) {
      return res.status(200).json({ 
        repos: cachedRepos,
        cached: true,
        timestamp: new Date()
      });
    }

    // 2. Prevent cache stampede
    const lockKey = `${cacheKey}_lock`;
    if (cache.get(lockKey)) {
      return res.status(503).json({ 
        error: "Resource is being refreshed, please try again shortly" 
      });
    }
    cache.put(lockKey, true, 5000);

    try {
      // 3. Fetch from GitHub
      const response = await fetch(
        `https://api.github.com/search/repositories?q=language:${language}&sort=stars&order=desc&per_page=10`,
        {
          headers: {
            authorization: `token ${process.env.GITHUB_API_KEY}`
          }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${data.message || response.statusText}`);
      }

      // 4. Validate and cache response
      if (data.items && data.items.length > 0) {
        cache.put(cacheKey, data.items, 3600000); // 1 hour
      } else {
        cache.put(cacheKey, [], 60000); // 1 minute for empty
      }

      res.status(200).json({ 
        repos: data.items,
        cached: false
      });

    } finally {
      cache.del(lockKey); // Release lock
    }

  } catch (error) {
    console.error('Error in explorePopularRoutes:', error);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// export const explorePopularRoutes = async (req,res)=>{
  
//     const {language} = req.params;
  
//     try {
//         const response = await fetch(`https://api.github.com/search/repositories?q=language:${language}&sort=stars&order=desc&per_page=10`,
// 	    {
// 			headers: {
// 				authorization: `token ${process.env.GITHUB_API_KEY}`
// 			}
// 		}
// 	);
// 		const data = await response.json();  
//         res.status(200).json({repos:data.items})
//     } catch (error) {
//         res.status(500).json({error: error.message});
//     }
// }