import { User } from "../models/user.model.js";
import { invalidatedTokens } from "../middlewares/auth.middleware.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

// Register user
export const registerUser = async (req, res) => {
  try {
    const { fullName, name, username, email, password } = req.body;
    const resolvedFullName = fullName || name;

    if (
      !resolvedFullName ||
      !username ||
      !email ||
      !password ||
      typeof resolvedFullName !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !resolvedFullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingEmail = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const existingUsername = await User.findOne({
      username: username.toLowerCase().trim(),
    });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken",
      });
    }

    const avatar = `https://avatar.iran.liara.run/username?username=${resolvedFullName.trim()}`;

    const user = await User.create({
      fullName: resolvedFullName.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      avatar,
    });

    return res.status(201).json({
      success: true,
      data: {
        "_id": user._id,
        "fullName": user.fullName,
        "username": user.username,
        "email": user.email,
        "avatar": user.avatar,
      },
      message: "User created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering the user",
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist with this email",
      });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const accessToken = user.generateAccessToken();

    res.cookie("accessToken", accessToken, cookieOptions);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          "_id": user._id,
          "fullName": user.fullName,
          "username": user.username,
          "email": user.email,
          "avatar": user.avatar,
        },
        accessToken,
      },
      message: "User logged in successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
};

// Logout user
export const logoutUser = async (req, res) => {
  try {
    const rawCookie = req.headers?.cookie;
    let cookieToken = req.cookies?.accessToken;
    if (!cookieToken && rawCookie) {
      const match = rawCookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("accessToken="));
      if (match) {
        cookieToken = match.substring("accessToken=".length);
      }
    }

    const token =
      req.token ||
      cookieToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      invalidatedTokens.add(token);
    }

    res.clearCookie("accessToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "User logged out",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error during logout process",
    });
  }
};

// Get current user profile
export const getUserProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        "_id": req.user._id,
        "fullName": req.user.fullName,
        "username": req.user.username,
        "email": req.user.email,
        "avatar": req.user.avatar,
      },
      message: "User fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm || !searchTerm.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const regex = new RegExp(searchTerm.trim(), "i");
    const users = await User.find({
      $or: [{ username: regex }, { email: regex }],
    }).select("_id fullName username email avatar");

    return res.status(200).json({
      success: true,
      data: users,
      message: "Users fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error searching users",
    });
  }
};
