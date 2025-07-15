import express from "express";
import userRoutes from "./routes/user.route.js";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import path from "path";
import "./passport/github.auth.js";
import rateLimit from "express-rate-limit";

import exploreRoutes from "./routes/explore.route.js";
import authRoutes from "./routes/auth.route.js";
import connectMongoDB from "./db/connectMongoDB.js";


dotenv.config();

const app = express();
const PORT= process.env.PORT || 5000;
const __dirname = path.resolve();

app.listen(PORT, ()=>{
    console.log(`Server started on http://localhost:${PORT}`);
    connectMongoDB();
})

app.use(cors({
  origin: process.env.CLIENT_BASE_URL, // e.g., http://localhost:3000
  credentials: true // ✅ required to allow cookies
}));

console.log(__dirname);


// app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: false}));
app.use(session({
  secret: process.env.SESSION_SECRET || "keyboard cat",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true on Render
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const authCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 requests per minute per IP
  message: "Too many requests, slow down."
});

// ✅ Apply it to only /api/auth/check route
app.use("/api/auth/check", authCheckLimiter);

app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/explore",exploreRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend","dist","index.html"))
})

