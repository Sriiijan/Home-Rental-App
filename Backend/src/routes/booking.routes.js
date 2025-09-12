import { Router } from "express";
import { createBooking, getReservations } from "../controllers/Booking.controller.js";

const router= Router();

router.route('/create').post(createBooking)
router.route('/:hostId/reservations').get(getReservations)
export default router;