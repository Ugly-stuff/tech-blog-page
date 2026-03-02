import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import User from "./models/User.js";
import Blog from "./models/Blog.js";
import admin from "./firebaseAdmin.js";
import authMiddleware from "./middleware/authMiddleware.js";
import blogRoutes from "./routes/blogRoutes.js";

dotenv.config();

const app = express();

/* =========================
   CORS (PRODUCTION READY)
========================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://tech-blog-page.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   FILE UPLOAD SETUP
========================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
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
  allowedMimeTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Invalid file type"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.use("/uploads", express.static(uploadDir));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "No file uploaded" });

  res.json({
    success: true,
    fileUrl: `/uploads/${req.file.filename}`,
  });
});

/* =========================
   DATABASE
========================= */

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

const JWT_SECRET = process.env.JWT_SECRET;

/* =========================
   ROUTES
========================= */

app.use("/api/blogs", blogRoutes);

/* ===== SIGNUP ===== */
app.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ status: "error", message: "Email exists" });

    const newUser = new User({
      email,
      username,
      password,
      authProvider: "local",
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      status: "ok",
      token,
      userId: newUser._id,
      email: newUser.email,
      username: newUser.username,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Signup failed" });
  }
});

/* ===== LOGIN ===== */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ status: "error", message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ status: "error", message: "Wrong password" });

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      status: "ok",
      token,
      userId: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    res.json({ status: "error", message: "Login failed" });
  }
});

/* ===== GOOGLE AUTH ===== */
app.post("/auth/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, user_id: googleId } = decoded;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        username: email.split("@")[0],
        authProvider: "google",
        googleId,
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      status: "ok",
      token,
      userId: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    res.status(401).json({ status: "error", message: "Google auth failed" });
  }
});

/* ===== PROFILE ===== */
app.get("/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  res.json({ status: "ok", user });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});