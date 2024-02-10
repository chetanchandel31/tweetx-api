import express from "express";
import authSignInHandler from "./controllers/auth/sign-in";
import authSignUpHandler from "./controllers/auth/sign-up";
import { validateAuthToken } from "./middlewares/validateAuthToken";
import userGetProfileHandler from "./controllers/user/get-profile";
import userListHandler from "./controllers/user/list";

const router = express.Router();

router.post("/auth/sign-up", authSignUpHandler);
router.post("/auth/sign-in", authSignInHandler);

router.post("/user/get-profile", validateAuthToken, userGetProfileHandler);
router.post("/user/list", validateAuthToken, userListHandler);

export default router;
