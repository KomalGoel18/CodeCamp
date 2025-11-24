import User from "../models/User.js";
import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ message: "User not found" });

    // extra stats: breakdown of submissions and streak
    const totalSubmissions = user.totalSubmissions || 0;
    const totalSolved = user.totalSolved || 0;
    const easy = user.solvedByDifficulty.easy || 0;
    const medium = user.solvedByDifficulty.medium || 0;
    const hard = user.solvedByDifficulty.hard || 0;

    // current streak (basic): if lastSolvedAt is yesterday or today -> 1 or more
    let streak = 0;
    if (user.lastSolvedAt) {
      // you can compute a more elaborate streak logic; for now we expose lastSolvedAt
      streak = 1; // frontend can compute multi-day streak if lastSolvedAt stored
    }

    res.json({
      username: user.username,
      email: user.email,
      totalSolved,
      totalSubmissions,
      solvedByDifficulty: { easy, medium, hard },
      lastSolvedAt: user.lastSolvedAt,
      streak
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};