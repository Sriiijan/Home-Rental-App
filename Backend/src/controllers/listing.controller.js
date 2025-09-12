import { Listing } from "../models/listing.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// ✅ Create new listing
const createListing = asyncHandler(async (req, res) => {
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
    price,
  } = req.body;

  if (!category || !type || !address || !city || !title || !price || !amenities) {
    throw new ApiError(400, "Required fields are missing");
  }

  let listingPhotos = [];
  if (req.files && Object.keys(req.files).length > 0) {
    const files = req.files.images || req.files.listingPhotos || [];
    if (files.length === 0) throw new ApiError(400, "At least one image is required");

    const uploadPromises = files.map((file) => uploadOnCloudinary(file.path));
    const uploadResults = await Promise.all(uploadPromises);

    listingPhotos = uploadResults.filter((result) => result !== null);
    if (listingPhotos.length === 0) throw new ApiError(400, "Error while uploading photos");
  } else {
    throw new ApiError(400, "Images are required");
  }

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
    listingPhotos: listingPhotos.map((photo) => photo.url),
  });

  if (!newListing) throw new ApiError(500, "Failed to create listing");

  // ✅ Add this listing to user's propertyList
  await addPropertyToUser(creator, newListing._id);

  const createdListing = await Listing.findById(newListing._id).populate("creator");

  return res
    .status(201)
    .json(new ApiResponse(201, createdListing, "Listing created successfully"));
});

// ✅ Get all listings (with optional category filter)
const getListings = asyncHandler(async (req, res) => {
  const qCategory = req.query.category;

  let listings;
  if (qCategory) {
    listings = await Listing.find({ category: qCategory }).populate(
      "creator",
    //   "name email"
    );
  } else {
    listings = await Listing.find().populate("creator");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, listings, "Listings fetched successfully"));
});

// ✅ Get single listing details
const getListingDetails = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  if (!listingId) {
    throw new ApiError(400, "ListingId is required");
  }

  const listing = await Listing.findById(listingId).populate(
    "creator",
    // "name email profilePhoto"
  );

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, listing, "Listing fetched successfully"));
});

// Get user's properties
const getUserProperties = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Valid user ID required");
  }

  const user = await User.findById(userId)
    .select('propertyList')
    .populate({
      path: 'propertyList',
      populate: {
        path: 'creator',
        select: 'firstName lastName profileImage'
      }
    });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      properties: user.propertyList,
      count: user.propertyList.length
    }, "Properties fetched successfully")
  );
});

// Delete a listing and update user's property list
const deleteListing = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const { userId } = req.body; // or get from auth middleware

  if (!listingId || !isValidObjectId(listingId)) {
    throw new ApiError(400, "Valid listing ID required");
  }

  // Find the listing
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Verify ownership (optional - add auth middleware)
  if (userId && listing.creator.toString() !== userId) {
    throw new ApiError(403, "You can only delete your own listings");
  }

  // Remove from user's property list
  await removePropertyFromUser(listing.creator, listingId);

  // Delete the listing
  await Listing.findByIdAndDelete(listingId);

  return res.status(200).json(
    new ApiResponse(200, null, "Listing deleted successfully")
  );
});

// Export the functions
export {
  getUserProperties,
  createListing,
  getListings,
  getListingDetails,
  deleteListing
};
