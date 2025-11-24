import { executeJudge0 } from "../utils/judge0Client.js";

export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin } = req.body;
    if (!source_code || !language_id)
      return res.status(400).json({ message: "source_code and language_id are required" });

    const result = await executeJudge0({ language_id, source_code, stdin });

    res.status(200).json({
      stdout: result.stdout,
      stderr: result.stderr,
      status: result.status?.description,
      time: result.time,
      memory: result.memory,
    });
  } catch (error) {
    res.status(500).json({ message: "Error executing code", error: error.message });
  }
};