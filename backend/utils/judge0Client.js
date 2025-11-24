// backend/utils/judge0Client.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Base URL for Judge0 CE API via RapidAPI
const JUDGE0_BASE_URL = "https://judge0-ce.p.rapidapi.com/submissions";

/**
 * Submits code to Judge0 CE (RapidAPI)
 */
export const executeJudge0 = async ({ language_id, source_code, stdin }) => {
  try {
    // Ensure key and host exist before making request
    if (!process.env.JUDGE0_API_KEY || !process.env.JUDGE0_HOST) {
      throw new Error("Judge0 credentials missing. Check .env (JUDGE0_API_KEY / JUDGE0_HOST).");
    }

    const response = await axios.post(
      `${JUDGE0_BASE_URL}?base64_encoded=false&wait=true`,
      {
        language_id,
        source_code,
        stdin: stdin || "",
      },
      {
        headers: {
          "x-rapidapi-key": process.env.JUDGE0_API_KEY.trim(), // ✅ ensure no trailing spaces
          "x-rapidapi-host": process.env.JUDGE0_HOST.trim(),
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("⚠️ Judge0 API Error:", err.response?.status, err.response?.data || err.message);
    throw err;
  }
};
