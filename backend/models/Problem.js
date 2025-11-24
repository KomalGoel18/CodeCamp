// backend/models/Problem.js
import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
});

const exampleSchema = new mongoose.Schema({
  input: String,
  output: String,
  explanation: String,
});

const problemSchema = new mongoose.Schema({
  problemNumber: { type: Number, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: "array" }, // category/tag e.g., array, hash, tree
  tags: [{ type: String }], // additional tags
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
  constraints: String,
  examples: [exampleSchema],           // visible examples (>=2)
  sampleTests: [testCaseSchema],      // visible tests (Run)
  hiddenTests: [testCaseSchema],      // hidden tests (Submit)
  timeLimitSeconds: { type: Number, default: 2 },
  memoryLimitMB: { type: Number, default: 256 },
}, { timestamps: true });

export default mongoose.model("Problem", problemSchema);