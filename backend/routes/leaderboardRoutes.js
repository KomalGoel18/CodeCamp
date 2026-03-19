// backend/routes/leaderboardRoutes.js
import express from "express";
import { getLeaderboard, getLeaderboardStats } from "../controllers/leaderboardController.js";

const router = express.Router();

// The /stats route must come BEFORE /:id (if there's ever one)
router.get("/stats", getLeaderboardStats);
router.get("/", getLeaderboard);

export default router;