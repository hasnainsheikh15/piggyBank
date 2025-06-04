import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

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

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Username and password are required"));
  }

  const user = await User.findOne({
    $or: [{ username }, { password }],
  });

  if (!user) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid username or password"));
  }

  const isPasswordCorrect = await user.isPasswordMatch(password);
  if (!isPasswordCorrect) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid  password"));
  }

  const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly : true,
    secure : true
  }

  return res.status(200).cookie("refreshToken",refreshToken,options).cookie("accessToken",accessToken,options).json(new ApiResponse(200,{
    user: loggedInUser,
    accessToken,
    refreshToken,

  }, "User logged in successfully"));


});

export { registerUser ,generateAccessAndRefreshToken, loginUser };
