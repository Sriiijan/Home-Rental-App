import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import {createListing, getListings, getListingDetails, searchListings} from "../controllers/listing.controller.js"

const router= Router();

router.route("/create").post(
    upload.fields([
        { name: 'listingPhotos', maxCount: 10 }
    ]),
    createListing
)
router.route("/").get(getListings)
router.route("/:listindId").get(getListingDetails)
router.route("/search/:search").get(searchListings)

export default router;