import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import fs from "fs"
import { Booking } from "../models/booking.model.js"
import { isValidObjectId } from "mongoose"
import {Listing} from "../models/listing.model.js"

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

        user.token= token

        await user.save({
            validateBeforeSave: false
        })

        return {token}
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating token")
    }
}

// Helper function to sync user's trip list
const syncUserTripList = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const trips = await Booking.find({ customerId: userId });
        user.tripList = trips.map(trip => trip._id);
        await user.save();
        
        return user;
    } catch (error) {
        console.error('Error syncing trip list:', error);
    }
};

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

    if(existedUser) {
        // Clean up uploaded file before throwing error
        deleteLocalFile(profileImageLocalPath);
        throw new ApiError(409, "User with email already exist");
    }

    const profileImage= await uploadOnCloudinary(profileImageLocalPath);

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

    const createdUser= await User.findById(user._id).select(
        "-password"
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while user registration")
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

    // Sync trip list on login
    await syncUserTripList(user._id);

    const loggedInUser= await User.findById(user._id)
        .select("-password -token")
        .populate('tripList wishList');

    return res.status(200).json(
        new ApiResponse(200,
            {
                user: loggedInUser, token
            }, "User Logged In Successfully")
    )
})

// Just fetch trips without modifying user
const getTripList= asyncHandler(async (req, res) => {
    const {userId}= req.params
    
    if(!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "UserId required");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const trips= await Booking.find({customerId: userId})
        .populate("customerId hostId listingId");

    // Always return trips array (empty if none found)
    return res.status(200).json(
        new ApiResponse(200, trips || [], "Trips fetched successfully")
    )
})

// New function to manually sync user's tripList
const syncTripList = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Valid userId required");
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Find all trips for this user
    const trips = await Booking.find({ customerId: userId });
    
    // Update user's tripList with trip IDs
    user.tripList = trips.map(trip => trip._id);
    await user.save();

    // Return updated user (without sensitive data)
    const updatedUser = await User.findById(userId)
        .select('-password -token')
        .populate('tripList wishList');

    return res.status(200).json(
        new ApiResponse(200, {
            user: updatedUser,
            tripsCount: trips.length
        }, "User trip list synchronized successfully")
    );
});

// Function to get user with all populated data
const getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Valid userId required");
    }

    const user = await User.findById(userId)
        .select('-password -token')
        .populate({
            path: 'tripList',
            populate: {
                path: 'customerId hostId listingId'
            }
        })
        .populate('wishList');

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User profile fetched successfully")
    );
});

const toggleWishlist = asyncHandler(async (req, res) => {
    const { userId, listId } = req.params;

    // Validate userId
    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Missing or invalid user Id");
    }

    // Validate listId
    if (!listId || !isValidObjectId(listId)) {
        throw new ApiError(400, "Missing or invalid list Id");
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Find property
    const property = await Listing.findById(listId);
    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    // Initialize wishlist if it doesn't exist
    if (!user.wishList) {
        user.wishList = [];
    }

    // Check if property is already in wishlist
    const wishlistIndex = user.wishList.findIndex(
        (item) => item.toString() === listId
    );

    let wish;
    let message;

    if (wishlistIndex === -1) {
        // Property not in wishlist, add it (store only the ID)
        user.wishList.push(property._id);
        wish = true;
        message = "Added to wishlist";
    } else {
        // Property is in wishlist, remove it
        user.wishList.splice(wishlistIndex, 1);
        wish = false;
        message = "Removed from wishlist";
    }

    // Save user
    await user.save();

    // Get updated user with populated wishlist
    const updatedUser = await User.findById(userId)
        .select('-password -token')
        .populate('wishList');

    // Return updated user data
    return res.status(200).json(
        new ApiResponse(200, {
            wishList: updatedUser.wishList,
            user: updatedUser,
            isWishlisted: wish
        }, message)
    );
});

const getWishList = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "User id is invalid or missing");
    }

    // Find user and populate wishList
    const user = await User.findById(userId)
    .select('wishList')
    .populate({
        path: 'wishList',
        populate: {
            path: 'creator', // If you want to populate the listing creator as well
            select: 'firstName lastName profileImage'
        }
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Get the wishlist items
    const wishList = user.wishList || [];

    return res.status(200).json(
        new ApiResponse(200, {
            wishList,
            count: wishList.length
        }, "Wishlist fetched successfully")
    );
});

const getProperty= asyncHandler(async (req, res) => {
    const {userId}= req.params;

    if(!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "User ID is missing or invalid");
    }

    const user = await User.findById(userId)
    .select("propertyList")
    .populate("propertyList");


    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const propertyList= user.propertyList || [];

    return res.status(200).json(
        new ApiResponse(200, propertyList, "Property List fetched successfully")
    )
})

const getUserById= asyncHandler(async (req, res) => {
    const {userId}= req.params;

    if(!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "User Id is missing or invalid");
    }

    const user= await User.findById(userId).select(
        "firstName lastName email phone profileImage"
    );

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    getTripList,
    toggleWishlist,
    syncTripList,
    getUserProfile,
    syncUserTripList, // Export helper for use in booking controller
    getWishList,
    getProperty,
    getUserById
}