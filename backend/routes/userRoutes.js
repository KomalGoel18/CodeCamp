import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

router.get("/public/:username", getPublicProfile);

export default router;