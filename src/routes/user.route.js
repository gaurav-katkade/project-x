import { Router } from "express";
import {
        userRegister,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changePassword,
        updatedAvatar,
        updatedCoverImage,
        getChannelProfile,
        getWatchHistory
} from "../controllers/users.controller.js";
// import {upload} from multer.middleware.js;
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import multer from "multer";
const router = Router();
// console.log(`userRegiseter  in user.router!!! ${userRegister}`)

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])
    ,userRegister);
router.route("/login").post(loginUser);
//secured routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").patch(verifyJWT,changePassword);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updatedAvatar);
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updatedCoverImage);
router.route("/channel/:username").get(verifyJWT,getChannelProfile);
router.route("/history").get(verifyJWT,getWatchHistory);
export default router;