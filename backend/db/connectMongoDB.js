import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function connectMongoDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo DB connected");
    } catch (error) {
        console.log("Error connecting to mongoDB", error.message);
    }
}