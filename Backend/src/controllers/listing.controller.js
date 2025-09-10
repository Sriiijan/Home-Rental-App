import { Listing } from "../models/listing.model.js";
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

  // Required field validation
  if (!category || !type || !address || !city || !title || !price || !amenities) {
    throw new ApiError(400, "Required fields are missing");
  }

  // Handle file uploads
  let listingPhotos = [];
  if (req.files && Object.keys(req.files).length > 0) {
    const files = req.files.images || req.files.listingPhotos || [];
    if (files.length === 0) {
      throw new ApiError(400, "At least one image is required");
    }

    const uploadPromises = files.map((file) => uploadOnCloudinary(file.path));
    const uploadResults = await Promise.all(uploadPromises);

    listingPhotos = uploadResults.filter((result) => result !== null);

    if (listingPhotos.length === 0) {
      throw new ApiError(400, "Error while uploading photos");
    }
  } else {
    throw new ApiError(400, "Images are required");
  }

  // Save listing
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

  if (!newListing) {
    throw new ApiError(500, "Failed to create listing");
  }

  const createdListing = await Listing.findById(newListing._id).populate(
    "creator",
    // "name email"
  );

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

export { createListing, getListings, getListingDetails };
