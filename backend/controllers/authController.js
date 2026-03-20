// backend/controllers/authController.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendMail from "../utils/mailer.js";
import dotenv from "dotenv";

dotenv.config();

/* ========================= REGISTER ========================= */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const user = await User.create({ username, email, password });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
};

/* ========================= LOGIN ========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    return res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

/* ========================= GET ME ========================= */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({ user });
  } catch (err) {
    console.error("GetMe Error:", err);
    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

/* ========================= FORGOT PASSWORD ========================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // ✅ SECURITY: Do NOT reveal whether user exists
    if (!user) {
      return res.json({
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour

    await user.save();

    const FRONTEND_URL =
      process.env.FRONTEND_URL || "https://solve-on.vercel.app";

    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
Reset your SolveOn password:

${resetUrl}

This link expires in 1 hour.
`;

    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        await sendMail({
          to: user.email,
          subject: "SolveOn Password Reset",
          text: message,
        });

        return res.json({
          message: "Password reset email sent",
        });
      } else {
        // DEV MODE
        return res.json({
          message: "Dev mode: reset link generated",
          resetToken,
          resetUrl,
        });
      }
    } catch (mailErr) {
      console.error("Mailer error:", mailErr);
      return res.status(500).json({
        message: "Failed to send email",
      });
    }
  } catch (err) {
    console.error("ForgotPassword Error:", err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

/* ========================= RESET PASSWORD ========================= */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password required",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const jwt = generateToken(user._id);

    return res.json({
      message: "Password reset successful",
      token: jwt,
    });
  } catch (err) {
    console.error("ResetPassword Error:", err);
    return res.status(500).json({
      message: "Reset failed",
    });
  }
};