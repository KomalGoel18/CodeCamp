// backend/controllers/leaderboardController.js
import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
  try {
    const top = await User.find().sort({ totalSolved: -1 }).limit(20).select("username totalSolved solvedByDifficulty");
    res.json(top);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};