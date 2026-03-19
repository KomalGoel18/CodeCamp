import axios from "axios";
import dotenv from "dotenv";
import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import User from "../models/User.js";

dotenv.config();

const RAPIDAPI_KEY = process.env.JUDGE0_API_KEY;
const RAPIDAPI_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

function wrapCode(language, code, input) {
  if (language === "javascript") {
    return `${code}\nconsole.log(solution(${JSON.stringify(input)}));`;
  }

  if (language === "python") {
    return `${code}\nprint(solution(${JSON.stringify(input)}))`;
  }

  return code;
}

export const submitSolution = async (req, res) => {
  try {
    const { problemId, problemNumber, code, language } = req.body;
    const userId = req.user._id;

    let problem = null;

    if (problemId && /^[0-9a-fA-F]{24}$/.test(String(problemId))) {
      problem = await Problem.findById(problemId);
    } else if (problemNumber !== undefined) {
      problem = await Problem.findOne({ problemNumber: Number(problemNumber) });
    }

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const submission = await Submission.create({
      user: userId,
      problem: problem._id,
      problemNumber: problem.problemNumber,
      code,
      language,
      verdict: "Pending",
    });

    const hiddenTests = problem.hiddenTests || [];

    if (!hiddenTests.length) {
      submission.verdict = "Internal Error";
      await submission.save();
      return res.status(500).json({ message: "No hidden tests configured" });
    }

    let verdict = "Accepted";
    let maxTime = 0;
    let maxMemory = 0;

    for (const test of hiddenTests) {
      const response = await axios.post(
        `https://${RAPIDAPI_HOST}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: wrapCode(language, code, test.input),
          language_id: mapLanguage(language),
          stdin: test.input,
        },
        {
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
            "Content-Type": "application/json",
          },
          timeout: 120000,
        }
      );

      const result = response.data;

      if (result.status.id !== 3) {
        verdict = mapJudge0Status(result.status);
        break;
      }

      const actual = String(result.stdout || "").trim();
      const expected = String(test.expectedOutput || "").trim();

      maxTime = Math.max(maxTime, Number(result.time || 0));
      maxMemory = Math.max(maxMemory, Number(result.memory || 0));

      if (actual !== expected) {
        verdict = "Wrong Answer";
        break;
      }
    }

    submission.verdict = verdict;
    submission.executionTime = maxTime;
    submission.memory = maxMemory;
    await submission.save();

    const user = await User.findById(userId);

    user.totalSubmissions = (user.totalSubmissions || 0) + 1;

    if (verdict === "Accepted") {
      const solvedBefore = await Submission.exists({
        user: userId,
        problem: problem._id,
        verdict: "Accepted",
        _id: { $ne: submission._id },
      });

      if (!solvedBefore) {
        user.totalSolved = (user.totalSolved || 0) + 1;
      }

      user.lastSolvedAt = new Date();
    }

    await user.save();

    return res.status(200).json({
      message: "Submission evaluated",
      submission,
    });
  } catch (error) {
    console.error("Submission Error:", error);

    res.status(500).json({
      message: "Error submitting code",
      error: error.message,
    });
  }
};

export const getSubmissionsByUser = async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user._id,
    })
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

export const getSubmissionResult = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("problem", "title difficulty category problemNumber");

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch submission result",
      error: error.message,
    });
  }
};

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