import { Router } from "express";
import {
  registerUser,
  sendOtp,
  verifyLogin,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRoute = Router();

// userRoute.use(verifyJWT);

userRoute.route("/register").post(registerUser);
userRoute.route("/send-otp").post(sendOtp);
userRoute.route("/verify-login").post(verifyLogin);

export default userRoute;
