import { Router } from "express";
import { cancelBooking, createBooking, getReservations } from "../controllers/Booking.controller.js";

const router= Router();

router.route('/create').post(createBooking)
router.route('/cancel/:bookingId').delete(cancelBooking)
router.route('/:hostId/reservations').get(getReservations)
export default router;