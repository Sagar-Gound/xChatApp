import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// Store for invalidated tokens
export const invalidatedTokens = new Set();

// JWT authentication middleware
export const verifyJWT = async (req, res, next) => {
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
      cookieToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Request - No token provided",
      });
    }

    if (invalidatedTokens.has(token)) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || "chatapp_jwt_secret_key_12345"
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    const user = await User.findById(decoded?._id || decoded?.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid access token",
    });
  }
};

