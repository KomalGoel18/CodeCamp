// backend/routes/problemRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createProblem, getProblems, getProblemByNumber } from "../controllers/problemController.js";

const router = express.Router();

// ✅ Authenticated users can create problems
router.post("/", protect, createProblem);

// Public routes
router.get("/", getProblems);
router.get("/:number", getProblemByNumber);

export default router;
