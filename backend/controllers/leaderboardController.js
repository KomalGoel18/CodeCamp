import User from "../models/User.js";
import Submission from "../models/Submission.js";

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find().select("username email totalSolved").lean();

    const difficultyStats = await Submission.aggregate([
      {
        $match: {
          verdict: "Accepted",
        },
      },
      {
        $lookup: {
          from: "problems",
          localField: "problem",
          foreignField: "_id",
          as: "problemDetails",
        },
      },
      {
        $unwind: "$problemDetails",
      },
      {
        $group: {
          _id: {
            user: "$user",
            problem: "$problem",
            difficulty: "$problemDetails.difficulty",
          },
        },
      },
      {
        $group: {
          _id: {
            user: "$_id.user",
            difficulty: "$_id.difficulty",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const difficultyMap = {};

    difficultyStats.forEach((item) => {
      const userId = String(item._id.user);
      const diff = String(item._id.difficulty).toLowerCase();

      if (!difficultyMap[userId]) {
        difficultyMap[userId] = {
          easy: 0,
          medium: 0,
          hard: 0,
        };
      }

      if (difficultyMap[userId][diff] !== undefined) {
        difficultyMap[userId][diff] = item.count;
      }
    });

    const leaderboard = users
      .map((u) => {
        const diff = difficultyMap[String(u._id)] || {
          easy: 0,
          medium: 0,
          hard: 0,
        };

        return {
          username: u.username,
          email: u.email,
          totalSolved: u.totalSolved || 0,
          easySolved: diff.easy,
          mediumSolved: diff.medium,
          hardSolved: diff.hard,
        };
      })
      .sort((a, b) => b.totalSolved - a.totalSolved)
      .map((u, index) => ({
        ...u,
        rank: index + 1,
      }));

    res.json(leaderboard);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLeaderboardStats = async (req, res) => {
  try {
    const totalParticipants = await User.countDocuments({});

    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          averageSolved: { $avg: "$totalSolved" },
          topSubmissions: { $max: "$totalSolved" },
        },
      },
    ]);

    const averageSolved =
      stats.length > 0
        ? Math.round(stats[0].averageSolved || 0)
        : 0;

    const topSubmissions =
      stats.length > 0
        ? stats[0].topSubmissions || 0
        : 0;

    res.json({
      totalParticipants,
      averageSolved,
      topSubmissions,
    });
  } catch (err) {
    console.error("Leaderboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};