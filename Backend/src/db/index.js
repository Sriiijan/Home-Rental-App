import mongoose from "mongoose";
import {DB_NAME} from "../constrants.js";

const connectDB= async () => {
    try {
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error: ", error)
        process.exit(1); // Exit the process with failure
    }
}

export default connectDB;  