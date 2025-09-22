import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";

// Fix the dotenv path - remove './' 
dotenv.config({
    path: '.env'  // or just dotenv.config()
})

connectDB()
.then(()=> {
    app.on("error", (error)=>{
        console.log("ERROR: ", error)
        throw error
    })

    // Render uses PORT environment variable
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running at port : ${PORT}`);
    })
})
.catch((error)=> {
    console.log("MongoDB connection failed !! ", error)
})