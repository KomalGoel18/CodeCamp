import axios from "axios";
import dotenv from "dotenv";
import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import User from "../models/User.js";

dotenv.config();

const RAPIDAPI_KEY = process.env.JUDGE0_API_KEY; // ensure correct variable
const RAPIDAPI_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

// ✅ Submit code for a problem
export const submitSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user._id;

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // Create submission entry (pending initially)
    const submission = await Submission.create({
      user: userId,
      problem: problemId,
      problemNumber: problem.problemNumber, // ✅ Your correct numbering
      code,
      language,
      verdict: "Pending",
    });

    // Send code to Judge0 API
    const response = await axios.post(
      `https://${RAPIDAPI_HOST}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: mapLanguage(language),
        stdin: problem.inputExample || "",
        expected_output: problem.expectedOutput || "",
      },
      {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data;

    // ✅ Step 1: Use Judge0 ID-based status mapping
    const verdict = mapJudge0Status(result.status);

    // ✅ Step 2: Update submission result fields
    submission.verdict = verdict;
    submission.executionTime = result.time || 0;
    submission.memory = result.memory || 0;
    submission.details = result;
    await submission.save();

    // ✅ Step 3: Update user stats
    const user = await User.findById(userId);
    user.totalSubmissions = (user.totalSubmissions || 0) + 1;

    if (verdict === "Accepted") {
      // Only count as new solve if this problem wasn’t solved before
      const alreadySolved = await Submission.exists({
        user: userId,
        problem: problemId,
        verdict: "Accepted",
      });

      if (!alreadySolved) {
        user.totalSolved = (user.totalSolved || 0) + 1;
      }
      user.lastSolvedAt = new Date(); // For streak tracking
    }

    await user.save();

    return res.status(200).json({
      message: "Submission completed",
      submission,
    });
  } catch (error) {
    console.error("Submission Error:", error);
    return res.status(500).json({
      message: "Error submitting code",
      error: error.message,
    });
  }
};

// ✅ Get all submissions by user
export const getSubmissionsByUser = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate("problem", "title difficulty category problemNumber")
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

// ✅ Get submission result by ID
export const getSubmissionResult = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("problem", "title difficulty category problemNumber");

    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch submission result",
      error: error.message,
    });
  }
};

// ✅ Helper: Map language names to Judge0 IDs
const mapLanguage = (lang) => {
  const languages = {
    cpp: 54,
    c: 50,
    python: 71,
    java: 62,
    javascript: 63,
  };
  return languages[lang.toLowerCase()] || 63;
};

// ✅ Helper: Map Judge0 status.id → Verdict
const mapJudge0Status = (status) => {
  const id = status?.id;
  switch (id) {
    case 3:
      return "Accepted";
    case 4:
      return "Wrong Answer";
    case 5:
      return "Time Limit Exceeded";
    case 6:
      return "Compilation Error";
    case 7:
      return "Runtime Error";
    default:
      return "Internal Error";
  }
};
