import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { sendEmail } from "../utils/sendEmail.js";
import { ApiError } from "../utils/apiError.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, phone, password, dateOfBirth } = req.body;

  if (!name || !username || !email || !phone || !password || !dateOfBirth) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All fields are required"));
  }

  const userExisted = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExisted) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User already exists"));
  }
  const user = await User.create({
    name,
    username,
    email,
    phone,
    password,
    dateOfBirth,
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "User creation failed"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, userCreated, "User created successfully"));
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // this is done to avoid the validation of the user schema as we are not updating the password and we don't want to check for the password again and again so this is done to avoid that validation
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token Generation Error:", error);

    throw new ApiError(500, "Something went wrong while generating the tokens");
  }
};

const sendOtp = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(email || password)) {
    throw new ApiResponse(400, null, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiResponse(404, null, "User not found");
  }

  const isPasswordValid = await user.isPasswordMatch(password);
  if (!isPasswordValid) {
    throw new ApiResponse(401, null, "Invalid password");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});

const verifyLogin = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!(email || otp)) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password  -refreshToken  -otp  -optExpiry"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, option)
    .cookie("accessToken", accessToken, option)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Login successful"
      )
    );
});

export { registerUser, generateAccessAndRefreshToken, sendOtp , verifyLogin };
