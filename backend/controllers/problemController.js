// backend/controllers/problemController.js
import Problem from "../models/Problem.js";
import Counter from "../models/Counter.js";

/**
 * getNextProblemNumber - atomic counter (uses Counter model)
 */
const getNextProblemNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "problemNumber" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};

// Create problem (admin)
export const createProblem = async (req, res) => {
  try {
    const nextNumber = await getNextProblemNumber();
    const payload = { problemNumber: nextNumber, ...req.body };
    const problem = await Problem.create(payload);
    res.status(201).json({ message: "Problem created", problem });
  } catch (err) {
    console.error("Create problem error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/problems
 * Query params:
 *  - difficulty (Easy/Medium/Hard)
 *  - category (array, hash, tree, ...)
 *  - tags (comma-separated)
 *  - sortBy (problemNumber | recent | difficulty | title)
 *  - order (asc | desc)
 *  - search (text search on title)
 *  - page, limit
 */
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
      const arr = tags.split(",").map(t => t.trim()).filter(Boolean);
      if (arr.length) filter.tags = { $in: arr };
    }
    if (search) filter.title = { $regex: search, $options: "i" };

    // sorting
    const sortMap = {
      problemNumber: { problemNumber: order === "asc" ? 1 : -1 },
      recent: { createdAt: order === "asc" ? 1 : -1 },
      difficulty: { difficulty: order === "asc" ? 1 : -1 },
      title: { title: order === "asc" ? 1 : -1 },
    };
    const sortObj = sortMap[sortBy] || sortMap.problemNumber;

    const skip = (Number(page) - 1) * Number(limit);
    const [problems, total] = await Promise.all([
      Problem.find(filter).sort(sortObj).skip(skip).limit(Number(limit)).lean().select("problemNumber title category difficulty tags"),
      Problem.countDocuments(filter)
    ]);

    res.json({ results: problems, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error("Get problems error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/problems/:number -> return problem by problemNumber, but do NOT include hiddenTests
export const getProblemByNumber = async (req, res) => {
  try {
    const number = Number(req.params.number);
    const problem = await Problem.findOne({ problemNumber: number }).lean();
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // remove hidden tests before sending
    delete problem.hiddenTests;
    res.json(problem);
  } catch (err) {
    console.error("Get problem error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
