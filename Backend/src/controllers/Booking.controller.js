import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js";
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";
import { syncUserTripList } from "./user.controller.js"; // Import the helper

const createBooking = asyncHandler(async(req, res) => {
    const {customerId, hostId, listingId, startDate, endDate, totalPrice} = req.body;

    // Validate all required fields
    if(!customerId || !hostId || !listingId || !startDate || !endDate || !totalPrice) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate ObjectIds
    if (!isValidObjectId(customerId) || !isValidObjectId(hostId) || !isValidObjectId(listingId)) {
        throw new ApiError(400, "Invalid ID format");
    }

    // Check if customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }

    // Check if host exists
    const host = await User.findById(hostId);
    if (!host) {
        throw new ApiError(404, "Host not found");
    }

    // Create the booking
    const booking = await Booking.create({
        customerId, 
        hostId, 
        listingId, 
        startDate, 
        endDate, 
        totalPrice
    });

    if(!booking) {
        throw new ApiError(400, "Failed to book this property");
    }

    // IMPORTANT: Sync both customer and host trip/reservation lists
    try {
        // Add to customer's trip list
        await User.findByIdAndUpdate(
            customerId,
            { $addToSet: { tripList: booking._id } }, // $addToSet prevents duplicates
            { new: true }
        );

        // Add to host's reservation list
        await User.findByIdAndUpdate(
            hostId,
            { $addToSet: { reservationList: booking._id } },
            { new: true }
        );

        console.log(`Booking ${booking._id} added to customer ${customerId} and host ${hostId}`);
    } catch (error) {
        console.error('Error updating user lists:', error);
        // Don't throw error here - booking was successful, just log the sync issue
    }

    // Populate the booking with related data before returning
    const populatedBooking = await Booking.findById(booking._id)
        .populate('customerId', 'firstName lastName email profileImage')
        .populate('hostId', 'firstName lastName email profileImage')
        .populate('listingId');

    return res.status(201).json(
        new ApiResponse(201, populatedBooking, "Property booked successfully")
    );
});

// Function to cancel a booking and update user lists
const cancelBooking = asyncHandler(async(req, res) => {
    const { bookingId } = req.params;

    if (!bookingId || !isValidObjectId(bookingId)) {
        throw new ApiError(400, "Valid booking ID required");
    }

    // Find the booking first
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    // Remove from customer's trip list
    await User.findByIdAndUpdate(
        booking.customerId,
        { $pull: { tripList: bookingId } }
    );

    // Remove from host's reservation list
    await User.findByIdAndUpdate(
        booking.hostId,
        { $pull: { reservationList: bookingId } }
    );

    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    return res.status(200).json(
        new ApiResponse(200, null, "Booking cancelled successfully")
    );
});

// Get all bookings for a host (reservations)
const getReservations = asyncHandler(async(req, res) => {
    const { hostId } = req.params;

    if (!hostId || !isValidObjectId(hostId)) {
        throw new ApiError(400, "Valid host ID required");
    }

    const reservations = await Booking.find({ hostId: hostId })
        .populate('customerId', 'firstName lastName email profileImage')
        .populate('listingId')
        .sort({ createdAt: -1 }) || [];

    return res.status(200).json(
        new ApiResponse(200, reservations, "Reservations fetched successfully")
    );
});

export {
    createBooking,
    cancelBooking,
    getReservations
}