import axios from "axios";

export const testJudge0 = async (req, res) => {
  try {
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        language_id: 71, // 71 = Python 3
        source_code: "print('Hello from Judge0!')",
        stdin: "",
      },
      {
        headers: {
          "x-rapidapi-key": process.env.JUDGE0_API_KEY,
          "x-rapidapi-host": process.env.JUDGE0_API_HOST,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Judge0 API test successful",
      output: response.data.stdout,
      status: response.data.status.description,
    });
  } catch (error) {
    console.error("Judge0 API test failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Judge0 API test failed",
      error: error.response?.data || error.message,
    });
  }
};