// backend/scripts/seed.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import Counter from "../models/Counter.js";
import Submission from "../models/Submission.js";

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

const MONGO = process.env.MONGO_URI;

const sampleProblems = [
  {
    title: "Two Sum",
    description: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    category: "array",
    tags: ["array", "hash"],
    difficulty: "Easy",
    constraints: "2 <= nums.length <= 10^5, -10^9 <= nums[i] <= 10^9",
    examples: [
      { input: "[2,7,11,15], target=9", output: "[0,1]", explanation: "2 + 7 = 9" },
      { input: "[3,2,4], target=6", output: "[1,2]", explanation: "2 + 4 = 6" }
    ],
    sampleTests: [
      { input: "4\n2 7 11 15\n9\n", expectedOutput: "0 1\n" },
      { input: "3\n3 2 4\n6\n", expectedOutput: "1 2\n" }
    ],
    hiddenTests: [
      { input: "5\n1 3 2 5 4\n5\n", expectedOutput: "1 2\n" }
    ]
  },
  {
    title: "Reverse String",
    description: "Reverse input string in-place.",
    category: "string",
    tags: ["string", "two-pointer"],
    difficulty: "Easy",
    constraints: "1 <= s.length <= 10^5",
    examples: [
      { input: "hello", output: "olleh", explanation: "reverse the string" },
      { input: "abcd", output: "dcba", explanation: "reverse the string" }
    ],
    sampleTests: [
      { input: "hello\n", expectedOutput: "olleh\n" },
      { input: "abcd\n", expectedOutput: "dcba\n" }
    ],
    hiddenTests: [
      { input: "racecar\n", expectedOutput: "racecar\n" }
    ]
  },
  {
    title: "Binary Tree Height",
    description: "Compute height of a binary tree given level order input.",
    category: "tree",
    tags: ["tree", "recursion"],
    difficulty: "Medium",
    constraints: "nodes <= 10^4",
    examples: [
      { input: "1 2 3 4 5 null 6", output: "3", explanation: "height is 3" },
      { input: "1 null 2 null 3", output: "3", explanation: "height is 3" }
    ],
    sampleTests: [
      { input: "1 2 3 4 5 null 6\n", expectedOutput: "3\n" },
      { input: "1 null 2 null 3\n", expectedOutput: "3\n" }
    ],
    hiddenTests: [
      { input: "2 4 5 null null 6 7\n", expectedOutput: "3\n" }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO, {});

    console.log("Connected to MongoDB:", MONGO);

    const reset = String(process.env.SEED_RESET || "").toLowerCase() === "true";
    const seedUserEmail = process.env.SEED_USER_EMAIL || "";

    // Clear certain collections ONLY if explicitly requested.
    // Default is NON-DESTRUCTIVE to avoid wiping real accounts.
    if (reset) {
      await Submission.deleteMany({});
      await Problem.deleteMany({});
      await Counter.deleteMany({});
      console.log("SEED_RESET=true -> cleared submissions, problems, counters");
    }

const adminEmail = "admin@SolveOn.local";
let admin = await User.findOne({ email: adminEmail });
if (!admin) {
  admin = await User.create({
    username: "admin",
    email: adminEmail,
    // plain password – will be hashed by User pre('save')
    password: "Admin@123",
    totalSolved: 0,
    totalSubmissions: 0,
  });
  console.log("Admin user created ->", adminEmail, "password: Admin@123");
}

    // Ensure counter starts at 0 or current last value
    let counter = await Counter.findOne({ name: "problemNumber" });
    if (!counter) {
      counter = await Counter.create({ name: "problemNumber", value: 0 });
      console.log("Counter created");
    } else {
      console.log("Counter found with value", counter.value);
    }

    // Create sample problems and set problemNumber sequentially
    for (const p of sampleProblems) {
      // check if title exists
      const exists = await Problem.findOne({ title: p.title });
      if (exists) {
        console.log("Problem exists, skipping:", p.title);
        continue;
      }
      // get next number atomically
      const next = await Counter.findOneAndUpdate(
        { name: "problemNumber" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );

      const created = await Problem.create({
        problemNumber: next.value,
        title: p.title,
        description: p.description,
        category: p.category,
        tags: p.tags,
        difficulty: p.difficulty,
        constraints: p.constraints,
        examples: p.examples,
        sampleTests: p.sampleTests,
        hiddenTests: p.hiddenTests,
      });

      console.log("Created problem:", created.title, "number:", created.problemNumber);
    }

    // Optionally seed a couple of Accepted submissions so dashboard isn't empty.
    // Picks the specified SEED_USER_EMAIL if provided; otherwise picks the first non-admin user.
    const targetUser =
      (seedUserEmail ? await User.findOne({ email: seedUserEmail }) : null) ||
      (await User.findOne({ email: { $ne: adminEmail } })) ||
      admin;

    const problems = await Problem.find({}).sort({ problemNumber: 1 }).limit(2);
    if (targetUser && problems.length > 0) {
      const createdSubs = [];
      for (const pr of problems) {
        const already = await Submission.findOne({
          user: targetUser._id,
          problem: pr._id,
          verdict: "Accepted",
        });
        if (already) continue;

        const sub = await Submission.create({
          user: targetUser._id,
          problem: pr._id,
          problemNumber: pr.problemNumber,
          code: "// seeded accepted submission",
          language: "javascript",
          verdict: "Accepted",
          executionTime: 0.01,
          memory: 1024,
        });
        createdSubs.push(sub._id.toString());
      }

      if (createdSubs.length > 0) {
        // Update user aggregates to match newly created accepted submissions.
        const acceptedDistinctProblems = await Submission.distinct("problem", {
          user: targetUser._id,
          verdict: "Accepted",
        });
        const totalSubmissions = await Submission.countDocuments({ user: targetUser._id });
        await User.updateOne(
          { _id: targetUser._id },
          {
            $set: {
              totalSolved: acceptedDistinctProblems.length,
              totalSubmissions,
              lastSolvedAt: new Date(),
            },
          }
        );
        console.log(
          "Seeded accepted submissions for:",
          targetUser.email,
          "newSubmissions:",
          createdSubs.length
        );
      } else {
        console.log("Accepted submissions already present; skipping submission seeding.");
      }
    } else {
      console.log("No target user or no problems found; skipping submission seeding.");
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();