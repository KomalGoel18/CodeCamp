// backend/scripts/seed.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import Counter from "../models/Counter.js";

const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/codecamp";

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
      { input: "5\n1 3 2 5 4\n6\n", expectedOutput: "1 2\n" }
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

    // Clear certain collections (optional)
    // await User.deleteMany({});
    // await Problem.deleteMany({});
    // await Counter.deleteMany({});

    // Create admin user (if not exists)
    const adminEmail = "admin@codecamp.local";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashed = await bcrypt.hash("Admin@123", 10);
      admin = await User.create({
        username: "admin",
        email: adminEmail,
        password: hashed,
        role: "admin",
        totalSolved: 0,
        totalSubmissions: 0,
      });
      console.log("Admin user created ->", adminEmail, "password: Admin@123");
    } else {
      console.log("Admin already exists:", adminEmail);
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

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();