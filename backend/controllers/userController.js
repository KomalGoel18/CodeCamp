import User from "../models/User.js";

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const solvedByDifficulty = user?.solvedByDifficulty ?? {};

    res.json({
      username: user.username,
      email: user.email,
      totalSolved: user.totalSolved || 0,
      totalSubmissions: user.totalSubmissions || 0,
      solvedByDifficulty: {
        easy: solvedByDifficulty.easy || 0,
        medium: solvedByDifficulty.medium || 0,
        hard: solvedByDifficulty.hard || 0,
      },
      lastSolvedAt: user.lastSolvedAt,
      streak: user.streak || 0,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    res.json({
      username: user.username,
      email: user.email,
      totalSolved: user.totalSolved || 0,
      totalSubmissions: user.totalSubmissions || 0,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Profile update failed",
    });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    }).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      username: user.username,
      totalSolved: user.totalSolved || 0,
      totalSubmissions: user.totalSubmissions || 0,
      streak: user.streak || 0,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};