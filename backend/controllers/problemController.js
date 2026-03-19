import Problem from "../models/Problem.js";
import Counter from "../models/Counter.js";
import Submission from "../models/Submission.js";

const getNextProblemNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "problemNumber" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};

export const createProblem = async (req, res) => {
  try {
    const nextNumber = await getNextProblemNumber();
    const payload = { problemNumber: nextNumber, ...req.body };

    const problem = await Problem.create(payload);

    res.status(201).json({
      message: "Problem created",
      problem,
    });
  } catch (err) {
    console.error("Create problem error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProblems = async (req, res) => {
  try {
    const {
      difficulty,
      category,
      tags,
      sortBy = "problemNumber",
      order = "asc",
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};

    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;

    if (tags) {
      const arr = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (arr.length) filter.tags = { $in: arr };
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const problemsList = await Problem.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Problem.countDocuments(filter);

    // aggregate stats
    const stats = await Submission.aggregate([
      {
        $group: {
          _id: "$problem",
          total_submissions: { $sum: 1 },
          total_accepted: {
            $sum: {
              $cond: [{ $eq: ["$verdict", "Accepted"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const statsMap = {};

    stats.forEach((s) => {
      statsMap[String(s._id)] = {
        total_submissions: s.total_submissions,
        total_accepted: s.total_accepted,
        acceptance_rate:
          s.total_submissions > 0
            ? Math.round((s.total_accepted / s.total_submissions) * 100)
            : 0,
      };
    });

    let results = problemsList.map((p) => {
      const pStats = statsMap[String(p._id)] || {
        total_submissions: 0,
        total_accepted: 0,
        acceptance_rate: 0,
      };

      return {
        ...p,
        ...pStats,
      };
    });

    // true sorting after stats merged
    results.sort((a, b) => {
      let aVal;
      let bVal;

      switch (sortBy) {
        case "title":
          aVal = a.title;
          bVal = b.title;
          break;

        case "difficulty":
          aVal = a.difficulty;
          bVal = b.difficulty;
          break;

        case "total_accepted":
          aVal = a.acceptance_rate;
          bVal = b.acceptance_rate;
          break;

        case "total_submissions":
          aVal = a.total_submissions;
          bVal = b.total_submissions;
          break;

        default:
          aVal = a.problemNumber;
          bVal = b.problemNumber;
      }

      if (typeof aVal === "string") {
        return order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return order === "asc" ? aVal - bVal : bVal - aVal;
    });

    res.json({
      results,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error("Get problems error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProblemByNumber = async (req, res) => {
  try {
    const number = Number(req.params.number);

    const problem = await Problem.findOne({ problemNumber: number }).lean();

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const stats = await Submission.aggregate([
      {
        $match: {
          problem: problem._id,
        },
      },
      {
        $group: {
          _id: null,
          total_submissions: { $sum: 1 },
          total_accepted: {
            $sum: {
              $cond: [{ $eq: ["$verdict", "Accepted"] }, 1, 0],
            },
          },
        },
      },
    ]);

    if (stats.length > 0) {
      problem.total_submissions = stats[0].total_submissions;
      problem.total_accepted = stats[0].total_accepted;
      problem.acceptance_rate =
        problem.total_submissions > 0
          ? Math.round((problem.total_accepted / problem.total_submissions) * 100)
          : 0;
    } else {
      problem.total_submissions = 0;
      problem.total_accepted = 0;
      problem.acceptance_rate = 0;
    }

    delete problem.hiddenTests;

    res.json(problem);
  } catch (err) {
    console.error("Get problem error:", err);
    res.status(500).json({ message: "Server error" });
  }
};