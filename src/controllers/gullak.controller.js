import { Gullak } from "../models/gullak.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createGullak = asyncHandler(async (req, res) => {
  const { name, description, targetAmount, deadline } = req.body;
  if (!(name || description || targetAmount)) {
    throw new ApiError(400, "All fields are required");
  }

  if (deadline && new Date(deadline) < new Date()) {
    throw new ApiError(400, "Deadline must be a future date");
  }
  const gullak = await Gullak.create({
    name,
    description,
    target_amount: targetAmount,
    deadline,
    owner: req.user._id,
  });

  if (!gullak) {
    throw new ApiError(500, "Gullak creation failed");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, gullak, "Gullak created successfully"));
});

const getGullaksOfUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }
  const gullaks = await Gullak.find({ owner: userId })
    .populate("owner", "-password -refreshToken")
    .sort({ createdAt: -1 });

  if (!gullaks || gullaks.length === 0) {
    throw new ApiError(404, "No gullaks found for this user");
  }

  const totalGullak = gullaks.length;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { gullaks, totalGullak },
        "Gullaks retrieved successfully"
      )
    );
});

const gullakDetails = asyncHandler(async(req,res) => {
    const {gullakId} = req.params;
    if (!gullakId) {
        throw new ApiError(400, "Gullak ID is required");
    }

    const gullak = await Gullak.findById(gullakId);
    if (!gullak) {
        throw new ApiError(404, "Gullak not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, gullak, "Gullak details retrieved successfully"));
})

export { createGullak, getGullaksOfUser , gullakDetails };
