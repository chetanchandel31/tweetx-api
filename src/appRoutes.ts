import express from "express";
import authSignInHandler from "./controllers/auth/sign-in";
import authSignUpHandler from "./controllers/auth/sign-up";
import postCreateHandler from "./controllers/post/create";
import postListHandler from "./controllers/post/list";
import userFollowHandler from "./controllers/user/follow";
import userGetProfileHandler from "./controllers/user/get-profile";
import userListHandler from "./controllers/user/list";
import userUnFollowHandler from "./controllers/user/unfollow";
import { validateAuthToken } from "./middlewares/validateAuthToken";

const router = express.Router();

router.post("/auth/sign-up", authSignUpHandler);
router.post("/auth/sign-in", authSignInHandler);

router.post("/user/get-profile", validateAuthToken, userGetProfileHandler);
router.post("/user/list", validateAuthToken, userListHandler);
router.post("/user/follow", validateAuthToken, userFollowHandler);
router.post("/user/unfollow", validateAuthToken, userUnFollowHandler);

router.post("/post/create", validateAuthToken, postCreateHandler);
router.post("/post/list", validateAuthToken, postListHandler);

export default router;
