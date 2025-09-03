import { ApiError } from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"
import jwt from "jsonwebtoken";


export const verifyJWT= asyncHandler(async(req, _, next)=>{ // As res is not required, we can use _ instead of res
    try {
            const token= req.header.Authorization
            console.log(token)
            if(!token){
                throw new ApiError(401, "Unauthorized request")
            }
        
            const decodedToken= jwt.verify(token, process.env.TOKEN_SECRET)
        
            const user= await User.findById(decodedToken?._id).select("-password")
            
            if(!user){
                throw new ApiError(401, "Invalid Access Token")
            }
        
            req.user= user
            next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token") 
    }
})

export const isAdmin= async (req, res, next) =>{
    try {
        const user= await User.findById(req.user._id);
        if(user.role !== "admin") {
            return res.status(401).send("Unauthorized");
        }
        else {
            next();
        }
    } catch (error) {
        console.log(error)
    }
}