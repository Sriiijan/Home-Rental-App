import { Listing } from "../models/listing.model.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'

const createListing = asyncHandler(async(req, res) => {
    // Extract user ID (assuming req.user has _id or id property)
    // const userId = req.user._id || req.user.id;

    const {
        creator,
        category,
        type,
        address,
        city,
        pincode,
        state,
        country,
        guestCount,
        bedroomCount,
        bedCount,
        bathroomCount,
        amenities,
        title,
        description,
        highlight,
        highlightDesc,
        price
    } = req.body;

    // Validate required fields
    if (!category || !type || !address || !city || !title || !price || !amenities) {
        throw new ApiError(400, "Required fields are missing");
    }

    console.log("Amenities: ", amenities);
    

    // Handle file uploads
    let listingPhotos = [];
    
    if (req.files && Object.keys(req.files).length > 0) {
        // If using upload.fields() with named fields
        const files = req.files.images || req.files.listingPhotos || [];
        
        if (files.length === 0) {
            throw new ApiError(400, "At least one image is required");
        }

        // Upload all files to Cloudinary
        const uploadPromises = files.map(file => uploadOnCloudinary(file.path));
        const uploadResults = await Promise.all(uploadPromises);
        
        // Filter out any failed uploads
        listingPhotos = uploadResults.filter(result => result !== null);
        
        if (listingPhotos.length === 0) {
            throw new ApiError(400, "Error while uploading photos");
        }
    } else {
        throw new ApiError(400, "Images are required");
    }

    // Create the listing
    const newListing = await Listing.create({
        creator,
        category,
        type,
        address,
        city,
        pincode,
        state,
        country,
        guestCount: parseInt(guestCount) || 1,
        bedroomCount: parseInt(bedroomCount) || 1,
        bedCount: parseInt(bedCount) || 1,
        bathroomCount: parseInt(bathroomCount) || 1,
        amenities,
        title,
        description,
        highlight,
        highlightDesc,
        price: parseFloat(price),
        listingPhotos: listingPhotos.map(photo => photo.url) // Assuming uploadOnCloudinary returns {url: '...'}
    });

    if (!newListing) {
        throw new ApiError(500, "Failed to create listing");
    }

    // Fetch the created listing (with await)
    const createdListing = await Listing.findById(newListing._id);

    return res.status(201).json(
        new ApiResponse(201, createdListing, "Listing created successfully")
    );
});

const getListings= asyncHandler (async(req, res) => {
    const qCategory= req.query.category;

    let listings;
    if(qCategory) {
        listings= await Listing.find({category: qCategory}).populate("creator")
    }
    else {
        listings= await Listing.find()
    }

    return res.status(200).json(
        new ApiResponse(200, listings, "Listings gets successfully")
    )
})

export {
    createListing,
    getListings
}