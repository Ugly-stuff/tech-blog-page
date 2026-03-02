import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import User from "./models/User.js";
import Blog from "./models/Blog.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import admin from "./firebaseAdmin.js";
import authMiddleware from "./middleware/authMiddleware.js";
import blogRoutes from "./routes/blogRoutes.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Setup file upload directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and videos are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});


app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(uploadDir));

// File upload route
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "File upload failed" });
  }
});

app.use("/api/blogs", blogRoutes);

const JWT_SECRET = process.env.JWT_SECRET;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ status: "error", message: "Email, username, and password are required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ status: "error", message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ status: "error", message: "Username already taken" });
    }

    const newUser = new User({
      email,
      username,
      password,
      authProvider: "local",
    });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      status: "ok",
      token,
      userId: newUser._id,
      email: newUser.email,
      username: newUser.username,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ status: "error", message: "Signup failed" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ status: "error", message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.json({ status: "error", message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ status: "error", message: "Wrong Password" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ status: "ok", token, userId: user._id, email: user.email, username: user.username });
  } catch (error) {
    console.error("Login error:", error);
    res.json({ status: "error", message: error.message });
  }
});

// Google login route
app.post("/auth/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ status: "error", message: "Token missing" });
    }

    if (!admin || !admin.auth) {
      return res
        .status(500)
        .json({ status: "error", message: "Firebase Admin not configured on server" });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, user_id: googleId, name: displayName = email.split("@")[0] } = decoded;

    if (!email) {
      return res.status(401).json({ status: "error", message: "Invalid token" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      let username = displayName.toLowerCase().replace(/\s+/g, "_");
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        username = username + Math.floor(Math.random() * 10000);
      }

      user = await User.create({
        email,
        username,
        password: null,
        authProvider: "google",
        googleId,
      });
    }

    const jwtToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      status: "ok",
      token: jwtToken,
      userId: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ status: "error", message: "Invalid Google Token" });
  }
});

// Get profile
app.get("/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  res.json({ status: "ok", user });
});

// Delete account
app.delete("/account", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    await Blog.deleteMany({ authorId: userId.toString() });
    await User.findByIdAndDelete(userId);

    res.json({ status: "ok", message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ status: "error", message: "Failed to delete account" });
  }
});

app.listen(5000, () => console.log("Server running on Port 5000"));