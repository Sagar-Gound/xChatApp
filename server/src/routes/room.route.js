import { Router } from "express";
import { initRoom, getUserRooms } from "../controllers/room.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/init").post(initRoom);
router.route("/userrooms").get(getUserRooms);

export default router;

