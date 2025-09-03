import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import fs from "fs"

const registerUser= asyncHandler(async (req, res) => {
    const {firstName, lastName, email, password}= req.body;

    if(!firstName || !lastName || !email || !password) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser= await User.findOne({email});

    // console.log("USER: ", existedUser)

    if(existedUser) {
        // fs.unlinkSync(localFilePath)
        throw new ApiError(409, "User with email already exist");
    }

    const profileImageLocalPath= req.file?.path;

    // console.log("LOCAL PATH: ", profileImageLocalPath);
    

    if(!profileImageLocalPath){
        throw new ApiError(400, "Profile Image is missing");
    }

    const profileImage= await uploadOnCloudinary(profileImageLocalPath);

    // console.log("CLOUDINARY: ", profileImage);
    

    if(!profileImage) {
        throw new ApiError(400, "Error while uploading profile image");
    }

    const user= await User.create({
        firstName,
        lastName,
        email,
        password,
        profileImage: profileImage.url
    })

    // console.log("USER: ", user);

    const createdUser= await User.findById(user._id).select(
        "-password"
    )

    // console.log("CREATED USER: ", createdUser);
    

    if(!createdUser) {
        throw new ApiError(500, "Something wnt wrong while user registration")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User Created Successfully")
    )    
});

export {
    registerUser
}