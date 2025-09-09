import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import {createListing, getListings} from "../controllers/listing.controller.js"

const router= Router();

router.route("/create").post(
    upload.fields([
        // { name: 'images', maxCount: 10 }
        { name: 'listingPhotos', maxCount: 10 }
    ]),
    createListing
)

router.route("/").get(getListings)

export default router;