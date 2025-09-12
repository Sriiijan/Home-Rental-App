import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { registerUser, loginUser, getTripList, toggleWishlist, getWishList, getProperty } from "../controllers/user.controller.js";

const router= Router();

router.route("/register").post(upload.single("profileImage"), registerUser)
router.route("/login").post(loginUser)
router.route("/:userId/trips").get(getTripList)
router.route("/:userId/:listId").patch(toggleWishlist)
router.route("/:userId/wishlists").get(getWishList)
router.route("/:userId/propertyList").get(getProperty)

export default router