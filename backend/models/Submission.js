// backend/models/Submission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    problemNumber: { type: Number }, // convenience copy of problem number
    code: { type: String, required: true },
    language: { type: String, required: true }, // e.g. "python", "cpp"
    verdict: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Wrong Answer",
        "Runtime Error",
        "Compilation Error",
        "Time Limit Exceeded",
        "Internal Error",
      ],
      default: "Pending",
    },
    executionTime: { type: Number }, // seconds or Judge0 time
    memory: { type: Number }, // bytes or KB depending on Judge0
    details: { type: mongoose.Schema.Types.Mixed }, // store judge output (stdout, stderr, compile_output, status)
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
