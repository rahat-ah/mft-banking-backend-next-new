import express from "express";
import { sendVerifyOtp, signUp, verifyOtp } from "../controller/auth-controller";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/send-verify-otp", sendVerifyOtp);
authRouter.post("/verify-otp", verifyOtp);

export default authRouter;
