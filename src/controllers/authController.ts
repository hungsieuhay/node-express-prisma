import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/database";
import { JwtUtils } from "../utils/jwt";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  ApiResponse,
} from "../types/auth";
import { AuthenticatedRequest } from "../middleware/auth";

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Check if req.body exists
      if (!req.body || typeof req.body !== "object") {
        const response: ApiResponse = {
          success: false,
          message:
            "Request body is missing or invalid. Please send JSON data with Content-Type: application/json",
          error: "INVALID_REQUEST_BODY",
        };
        res.status(400).json(response);
        return;
      }

      const { email, password, firstName, lastName }: RegisterRequest =
        req.body;

      // Validate required fields
      if (!email || !password) {
        const response: ApiResponse = {
          success: false,
          message: "Email and password are required",
          error: "VALIDATION_ERROR",
        };
        res.status(400).json(response);
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: "User with this email already exists",
          error: "USER_EXISTS",
        };
        res.status(409).json(response);
        return;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Generate tokens
      const accessToken = JwtUtils.generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshTokenPayload = {
        userId: user.id,
        tokenId: `refresh_${Date.now()}_${Math.random()}`,
      };

      const refreshToken = JwtUtils.generateRefreshToken(refreshTokenPayload);

      // Store refresh token in database
      const expiresAt = JwtUtils.getTokenExpiration(
        process.env.JWT_REFRESH_EXPIRES_IN || "7d"
      );

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      // Set cookies
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const response: ApiResponse<AuthResponse> = {
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          accessToken,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Registration error:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Check if req.body exists
      if (!req.body || typeof req.body !== "object") {
        const response: ApiResponse = {
          success: false,
          message:
            "Request body is missing or invalid. Please send JSON data with Content-Type: application/json",
          error: "INVALID_REQUEST_BODY",
        };
        res.status(400).json(response);
        return;
      }

      const { email, password }: LoginRequest = req.body;

      // Validate required fields
      if (!email || !password) {
        const response: ApiResponse = {
          success: false,
          message: "Email and password are required",
          error: "VALIDATION_ERROR",
        };
        res.status(400).json(response);
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid email or password",
          error: "INVALID_CREDENTIALS",
        };
        res.status(401).json(response);
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        const response: ApiResponse = {
          success: false,
          message: "Account is deactivated",
          error: "ACCOUNT_DEACTIVATED",
        };
        res.status(401).json(response);
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid email or password",
          error: "INVALID_CREDENTIALS",
        };
        res.status(401).json(response);
        return;
      }

      // Generate tokens
      const accessToken = JwtUtils.generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshTokenPayload = {
        userId: user.id,
        tokenId: `refresh_${Date.now()}_${Math.random()}`,
      };

      const refreshToken = JwtUtils.generateRefreshToken(refreshTokenPayload);

      // Store refresh token in database
      const expiresAt = JwtUtils.getTokenExpiration(
        process.env.JWT_REFRESH_EXPIRES_IN || "7d"
      );

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      // Set cookies
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const userResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      const response: ApiResponse<AuthResponse> = {
        success: true,
        message: "Login successful",
        data: {
          user: userResponse,
          accessToken,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Login error:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      let refreshToken = req.cookies?.refreshToken;

      // Also check Authorization header for refresh token
      if (!refreshToken && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
          refreshToken = authHeader.substring(7);
        }
      }

      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          message: "Refresh token is required",
          error: "REFRESH_TOKEN_REQUIRED",
        };
        res.status(401).json(response);
        return;
      }

      // Verify refresh token
      let decoded;
      try {
        decoded = JwtUtils.verifyRefreshToken(refreshToken);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid refresh token",
          error: "INVALID_REFRESH_TOKEN",
        };
        res.status(401).json(response);
        return;
      }

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        const response: ApiResponse = {
          success: false,
          message: "Refresh token expired or invalid",
          error: "REFRESH_TOKEN_EXPIRED",
        };
        res.status(401).json(response);
        return;
      }

      // Check if user is still active
      if (!storedToken.user.isActive) {
        const response: ApiResponse = {
          success: false,
          message: "Account is deactivated",
          error: "ACCOUNT_DEACTIVATED",
        };
        res.status(401).json(response);
        return;
      }

      // Generate new access token
      const newAccessToken = JwtUtils.generateAccessToken({
        userId: storedToken.user.id,
        email: storedToken.user.email,
      });

      // Set new access token cookie
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      const response: ApiResponse<{ accessToken: string }> = {
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: newAccessToken,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Token refresh error:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Logout user
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        // Remove refresh token from database
        await prisma.refreshToken.deleteMany({
          where: { token: refreshToken },
        });
      }

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      const response: ApiResponse = {
        success: true,
        message: "Logout successful",
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Logout error:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: "User not authenticated",
          error: "UNAUTHORIZED",
        };
        res.status(401).json(response);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
          error: "USER_NOT_FOUND",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof user> = {
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Get profile error:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: "User not authenticated",
          error: "UNAUTHORIZED",
        };
        res.status(401).json(response);
        return;
      }

      // Remove all refresh tokens for the user
      await prisma.refreshToken.deleteMany({
        where: { userId: req.user.userId },
      });

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      const response: ApiResponse = {
        success: true,
        message: "Logged out from all devices successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Logout all error:", error);
      const response: ApiResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }
}
