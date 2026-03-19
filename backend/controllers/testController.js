import axios from "axios";
import Problem from "../models/Problem.js";
import dotenv from "dotenv";
dotenv.config();

const LANGUAGE_MAP = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
};

function wrapCode(language, code, input) {
  if (language === "javascript") {
    return `${code}\nconsole.log(solution(${JSON.stringify(input)}));`;
  }

  if (language === "python") {
    return `${code}\nprint(solution(${JSON.stringify(input)}))`;
  }

  return code;
}

async function runOnJudge0(source, langId, stdin = "") {
  const url =
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";

  const payload = {
    language_id: langId,
    source_code: source,
    stdin,
  };

  const headers = {
    "x-rapidapi-key": process.env.JUDGE0_API_KEY,
    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    "Content-Type": "application/json",
  };

  const resp = await axios.post(url, payload, {
    headers,
    timeout: 120000,
  });

  return resp.data;
}

export const runTests = async (req, res) => {
  try {
    const { problemId, problemNumber, code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "code and language required" });
    }

    let problem = null;

    if (problemId && /^[0-9a-fA-F]{24}$/.test(String(problemId))) {
      problem = await Problem.findById(problemId);
    } else if (problemNumber !== undefined) {
      problem = await Problem.findOne({ problemNumber: Number(problemNumber) });
    }

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const sampleTests =
      Array.isArray(problem.sampleTests) && problem.sampleTests.length > 0
        ? problem.sampleTests
        : [];

    if (!sampleTests.length) {
      return res.status(400).json({ message: "No sample tests found" });
    }

    const langKey = language.toLowerCase();
    const langId = LANGUAGE_MAP[langKey];

    if (!langId) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const results = [];
    let passed = 0;

    for (const t of sampleTests) {
      const stdin = String(t.input || "");
      const expected = String(t.expectedOutput || "").trim();

      const wrappedCode = wrapCode(language, code, stdin);

      const judgeResp = await runOnJudge0(wrappedCode, langId);

      const actual = String(judgeResp.stdout || "").trim();

      const ok = actual === expected;

      if (ok) passed++;

      results.push({
        input: stdin,
        expected,
        actual,
        passed: ok,
        status: judgeResp.status?.description,
        stderr: judgeResp.stderr || null,
        compile_output: judgeResp.compile_output || null,
      });
    }

    return res.json({
      passed,
      total: results.length,
      results,
    });
  } catch (err) {
    console.error("runTests error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err?.message || String(err),
    });
  }
};