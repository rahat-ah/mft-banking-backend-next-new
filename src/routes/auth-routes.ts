import express from "express";
import {
  isAuth,
  logout,
  sendResetOtp,
  sendVerifyOtp,
  signin,
  signUp,
  verifyOtp,
  verifyResetOtp,
} from "../controller/auth-controller";
import userAuth from "../middlewere/userMiddlewere";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signin);
authRouter.post("/signout", logout);
authRouter.post("/send-verify-otp", sendVerifyOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-otp", verifyResetOtp);
authRouter.get("/is-authenticated", userAuth, isAuth);

export default authRouter;
