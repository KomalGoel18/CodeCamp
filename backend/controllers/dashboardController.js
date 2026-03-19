import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import User from "../models/User.js";

export const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    const totalSubmissions = await Submission.countDocuments({ user: userId });

    const solvedProblems = await Submission.distinct("problem", {
      user: userId,
      verdict: "Accepted",
    });

    const totalSolved = solvedProblems.length;

    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round((totalSolved / totalSubmissions) * 100)
        : 0;

    const difficultyStats = await Submission.aggregate([
      {
        $match: {
          user: userId,
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
      { $unwind: "$problemDetails" },
      {
        $group: {
          _id: {
            problemId: "$problem",
            difficulty: "$problemDetails.difficulty",
          },
        },
      },
      {
        $group: {
          _id: "$_id.difficulty",
          count: { $sum: 1 },
        },
      },
    ]);

    const difficultySummary = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    difficultyStats.forEach((s) => {
      const key = String(s._id || "").toLowerCase();
      if (difficultySummary.hasOwnProperty(key)) {
        difficultySummary[key] = s.count;
      }
    });

    const problemTotalsStats = await Problem.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
        },
      },
    ]);

    const problemTotals = {
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0,
    };

    problemTotalsStats.forEach((s) => {
      const key = String(s._id || "").toLowerCase();
      if (problemTotals.hasOwnProperty(key)) {
        problemTotals[key] = s.count;
      }
      problemTotals.total += s.count;
    });

    const totalUsersCount = await User.countDocuments({});

    const usersAhead = await User.countDocuments({
      totalSolved: { $gt: totalSolved },
    });

    const rank = usersAhead + 1;

    const percentile =
      totalUsersCount > 0
        ? Math.max(
            1,
            Math.round(((totalUsersCount - rank) / totalUsersCount) * 100)
          )
        : 0;

    const acceptedSubmissions = await Submission.find({
      user: userId,
      verdict: "Accepted",
    })
      .sort({ createdAt: 1 })
      .select("createdAt");

    const activityMap = new Map();

    acceptedSubmissions.forEach((sub) => {
      const dateStr = sub.createdAt.toISOString().slice(0, 10);
      activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
    });

    const activity = Array.from(activityMap.entries()).map(([date, value]) => ({
      date,
      value,
    }));

    const sortedDates = Array.from(activityMap.keys()).sort();

    let currentStreak = 0;
    let personalBestStreak = 0;
    let tempStreak = 0;
    let tempLastDate = null;

    const msPerDay = 1000 * 60 * 60 * 24;

    sortedDates.forEach((dateStr) => {
      const d = new Date(dateStr);
      d.setUTCHours(0, 0, 0, 0);
      const dTime = d.getTime();

      if (!tempLastDate) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((dTime - tempLastDate) / msPerDay);

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }

      personalBestStreak = Math.max(personalBestStreak, tempStreak);
      tempLastDate = dTime;
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (tempLastDate) {
      const diffDays = Math.round((today.getTime() - tempLastDate) / msPerDay);
      if (diffDays <= 1) {
        currentStreak = tempStreak;
      }
    }

    const displayName = user.username || user.email || "Coder";

    res.json({
      username: displayName,
      welcomeMessage: `Hi ${displayName}`,
      totalSolved,
      totalSubmissions,
      acceptanceRate,
      difficultySummary,
      problemTotals,
      rank,
      percentile,
      currentStreak,
      personalBestStreak,
      points: totalSolved * 10,
      activity,
      profileUrl: `/profile/${user._id}`,
      editable: true,
      lastSolvedAt: user.lastSolvedAt || null,
    });
  } catch (err) {
    console.error("Dashboard Fetch Error:", err);
    res.status(500).json({
      message: "Server error loading dashboard data",
    });
  }
};