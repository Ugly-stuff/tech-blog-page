import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  username: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    default: null // Google users no password 
  },

  authProvider: { 
    type: String,
    enum: ["local", "google"], 
    required: true
  },

  googleId: {
    type: String,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre("save", async function (next) {
    if (!this.password) return next(); //For Google user
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
});

const User = mongoose.model("User", userSchema);
export default User;