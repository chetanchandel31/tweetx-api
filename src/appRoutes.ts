import express from "express";
import authSignInHandler from "./controllers/auth/sign-in";
import authSignUpHandler from "./controllers/auth/sign-up";

const router = express.Router();

router.post("/auth/sign-up", authSignUpHandler);
router.post("/auth/sign-in", authSignInHandler);

// TODO: rm
// router.post("/habit/create", validateAuthToken, habitCreateHandler);

export default router;
