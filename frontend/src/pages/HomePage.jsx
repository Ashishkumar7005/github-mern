import React, { useCallback, useEffect, useState, useRef } from 'react';
import debounce from 'lodash.debounce'; // ✅ import
import Search from '../components/Search';
import SortRepos from '../components/SortRepos';
import ProfileInfo from '../components/ProfileInfo';
import Repos from '../components/Repos';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

const HomePage = () => {
	const [userProfile, setUserProfile] = useState(null);
	const [repos, setRepos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [sortType, setSortType] = useState("recent");

	const getUserProfileAndRepos = useCallback(async (username = "Ashishkumar7005") => {
		setLoading(true);
		try {
			const res = await fetch(`/api/users/profile/${username}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || "Failed to fetch user profile");

			const { repos, userProfile } = data;
			repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
			setRepos(repos);
			setUserProfile(userProfile);

			return { userProfile, repos };
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		getUserProfileAndRepos();
	}, [getUserProfileAndRepos]);

	// ✅ Debounce wrapper using useRef
	const debouncedSearchRef = useRef(
		debounce(async (username) => {
			setLoading(true);
			setRepos([]);
			setUserProfile(null);

			const { userProfile, repos } = await getUserProfileAndRepos(username);
			setUserProfile(userProfile);
			setRepos(repos);
			setSortType("recent");
			setLoading(false);
		}, 1000)
	).current;

	// ✅ Called from Search form
	const onSearch = (e, username) => {
		e.preventDefault();
		debouncedSearchRef(username); // call debounced version
	};

	const onSort = (sortType) => {
		if (sortType === "recent") {
			repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
		} else if (sortType === "stars") {
			repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
		} else if (sortType === "forks") {
			repos.sort((a, b) => b.forks_count - a.forks_count);
		}
		setSortType(sortType);
		setRepos([...repos]);
	};

	return (
		<div className='m-4'>
			<Search onSearch={onSearch} />
			{repos.length > 0 && <SortRepos onSort={onSort} sortType={sortType} />}
			<div className='flex gap-4 flex-col lg:flex-row justify-center items-start'>
				{userProfile && !loading && <ProfileInfo userProfile={userProfile} />}
				{!loading && <Repos repos={repos} />}
				{loading && <Spinner />}
			</div>
		</div>
	);
};

export default HomePage;






// import React, { useCallback, useEffect, useState } from 'react'
// import Search from '../components/Search'
// import SortRepos from '../components/SortRepos'
// import ProfileInfo from '../components/ProfileInfo'
// import debounce from 'lodash.debounce'; 
// import Repos from '../components/Repos'
// import toast from 'react-hot-toast'
// import Spinner from '../components/Spinner'

// const HomePage = () => {
//      const [userProfile, setUserProfile] = useState(null);
//      const [repos, setRepos] = useState([]);
//      const [loading, setLoading] = useState(false);
//      const [sortType, setSortType] = useState("recent");
 
//      const getUserProfileAndRepos = useCallback(async(username="Ashishkumar7005")=>{
//       setLoading(true);
//          try {
//           const res = await fetch(`/api/users/profile/${username}`);
//           // const {repos,userProfile} = await res.json();
//           const data = await res.json();
//           if (!res.ok) throw new Error(data?.error || "Failed to fetch user profile");

//           const { repos, userProfile } = data;
//             repos.sort((a,b)=> new Date(b.created_at)- new Date(a.created_at));
//             setRepos(repos);
//             setUserProfile(userProfile);
//             console.log("userprofile: ",userProfile);
//             console.log("urepos: ", repos);

//             return {userProfile,repos};

//          } catch (error) {
//             toast.error(error.message);
//          } finally{
//           setLoading(false);
//          }
//      },[]);


//     useEffect(()=>{
//          getUserProfileAndRepos();
//     },[getUserProfileAndRepos])

    

//      const onSearch = async(e,username)=>{
//       e.preventDefault();
//       setLoading(true);
//       setRepos([]);
//       setUserProfile(null);

//    const {userProfile,repos} = await  getUserProfileAndRepos(username)
//      setUserProfile(userProfile);
//      setRepos(repos);
//      setLoading(false);   
//      setSortType("recent");
//   }
    
//      const onSort  = (sortType) =>{
//           if(sortType==="recent"){
//                repos.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at) ) //descending order
//           } else if(sortType==="stars"){
//             repos.sort((a,b)=> b.stargazers_count -a.stargazers_count)  //descending order              
//           }else if(sortType==="forks"){
//             repos.sort((a,b)=> b.forks_count - a.forks_count) //descending order              
//           }
//           setSortType(sortType);
//           setRepos([...repos])
//      }

//   return (
//     <div className='m-4'>
//         <Search onSearch={onSearch} />
//        { repos.length > 0 && <SortRepos onSort={onSort} sortType = {sortType} /> }
//         <div className='flex gap-4 flex-col lg:flex-row justify-center items-start'>
//           { userProfile && !loading &&  <ProfileInfo userProfile={userProfile} /> }
            
//            {!loading && <Repos repos={repos} />}
//             {loading && <Spinner/>}
//         </div>
//     </div>
//   )
// }

// export default HomePage
