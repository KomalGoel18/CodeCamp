import express from "express";
import { testJudge0 } from "../controllers/testController.js";

const router = express.Router();

// Route to test Judge0 API connection
router.get("/judge0", testJudge0);

export default router;