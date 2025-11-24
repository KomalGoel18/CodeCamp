// backend/routes/submissionRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  submitSolution,
  getSubmissionsByUser,
  getSubmissionResult,
} from "../controllers/submissionController.js";

const router = express.Router();

router.post("/", protect, submitSolution);
router.get("/user", protect, getSubmissionsByUser);
router.get("/:id", protect, getSubmissionResult);

export default router;