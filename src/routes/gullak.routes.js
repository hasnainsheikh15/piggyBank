import { Router } from "express";
import {
  createGullak,
  getGullaksOfUser,
  gullakDetails,
} from "../controllers/gullak.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const gullakRoute = Router();
gullakRoute.use(verifyJWT);

gullakRoute.route("/create-gullak").post(createGullak);
gullakRoute.route("/get-gullaks/:userId").get(getGullaksOfUser);
gullakRoute.route("/gullak-details/:gullakId").get(gullakDetails)
export default gullakRoute;
