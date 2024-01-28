import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { changedCurrentPassword, changedUserAvtar, changedUserCoverImage, getCurrentUser, logedInUser, logedOut, refreshAccessToken, registerUser, updateUserDetails } from "../controllers/user.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avtar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
   registerUser
);

router.route("/login").post(logedInUser)

//secured routes
router.route("/logout").post(verifyJwt,logedOut)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/current-user").get(verifyJwt,getCurrentUser)
router.route("/ChangecurrentPassword").post(verifyJwt,changedCurrentPassword)
router.route("/update-user-details").put(verifyJwt,updateUserDetails)
router.route("/change-cover").put( upload.single("coverImage"),verifyJwt,changedUserCoverImage)
router.route("/change-avtar").put(upload.single('avtar'),verifyJwt,changedUserAvtar)



export default router;
