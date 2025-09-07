import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import fs from "fs"

// Helper function to safely delete local file
const deleteLocalFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Local file deleted: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error deleting local file: ${filePath}`, error);
    }
};

// Helper func to generate token
const generateToken= async (userId) => {
    try {
        const user= await User.findById(userId);

        if(!user) {
            throw new ApiError(404, "User not found")
        }
        const token= user.generateToken();

        // console.log("TOKEN: ",token)

        user.token= token

        await user.save({
            validateBeforeSave: false
        })

        return {token}
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating token")
    }
}

const registerUser= asyncHandler(async (req, res) => {
    const {firstName, lastName, email, password}= req.body;

    const profileImageLocalPath= req.file?.path;

    if(!profileImageLocalPath){
        throw new ApiError(400, "Profile Image is missing");
    }

    if(!firstName || !lastName || !email || !password) {
        // Clean up uploaded file before throwing error
        deleteLocalFile(profileImageLocalPath);
        throw new ApiError(400, "All fields are required")
    }

    const existedUser= await User.findOne({email});

    // console.log("USER: ", existedUser)

    if(existedUser) {
        // Clean up uploaded file before throwing error
        deleteLocalFile(profileImageLocalPath);
        throw new ApiError(409, "User with email already exist");
    }

    // console.log("LOCAL PATH: ", profileImageLocalPath);

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

const loginUser= asyncHandler(async (req, res) => {
    const {email, password}= req.body;

    if(!email) {
        throw new ApiError(400, "username or email is required");
    }

    const user= await User.findOne({email});

    if(!user) {
        throw new ApiError(404, "User doesn't exist");
    }

    const isPasswordValid= await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(400, "Invalid Credentials")
    }
    const {token}= await generateToken(user._id)

    const loggedInUser= await User.findById(user._id).select("-password -token");

    return res.status(200).json(
        new ApiResponse(200,
            {
                user: loggedInUser, token
            }, "User Loged In Successfully")
    )

})

export {
    registerUser,
    loginUser
}