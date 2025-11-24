// backend/controllers/authController.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendMail from "../utils/mailer.js"; // your mailer util (adjust path if needed)
import dotenv from "dotenv";
dotenv.config();

// Register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "username, email and password required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user (auth middleware required)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("GetMe Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot password — send reset token by email (or return token in response in dev)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user with that email" });

    // create reset token (raw token sent to user, hashed token stored)
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expires = Date.now() + 1000 * 60 * 60; // 1 hour

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    const message = `You requested a password reset. Use this link to reset your password (valid 1 hour):\n\n${resetUrl}`;

    try {
      // Try to send email using your mailer util; if not configured, return token for dev
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        await sendMail({
          to: user.email,
          subject: "Password reset for CodeCamp",
          text: message,
        });
        return res.json({ message: "Password reset email sent" });
      } else {
        // dev fallback — return token so frontend/dev can show link
        return res.json({
          message: "No SMTP configured — returning reset token (dev only)",
          resetToken,
          resetUrl,
        });
      }
    } catch (mailErr) {
      console.error("Mailer error:", mailErr);
      return res.status(500).json({ message: "Failed to send reset email" });
    }
  } catch (err) {
    console.error("ForgotPassword Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset password endpoint — accepts raw token in URL and new password in body
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // raw token from link
    const { password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and new password required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Optionally return JWT
    const jwt = generateToken(user._id);
    res.json({ message: "Password reset successful", token: jwt });
  } catch (err) {
    console.error("ResetPassword Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};