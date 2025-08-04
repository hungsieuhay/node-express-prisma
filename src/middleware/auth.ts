import { Request, Response, NextFunction } from "express";
import { JwtUtils } from "../utils/jwt";
import { ApiResponse } from "../types/auth";

export interface AuthenticatedRequest extends Request {
  user?:
    | {
        userId: string;
        email: string;
      }
    | undefined;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Try to get token from Authorization header
    const authHeader = req.headers.authorization;
    let token = JwtUtils.extractTokenFromHeader(authHeader);

    // If no token in header, try to get from cookies
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: "Access token is required",
        error: "UNAUTHORIZED",
      };
      res.status(401).json(response);
      return;
    }

    // Verify the token
    const decoded = JwtUtils.verifyAccessToken(token);

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Invalid or expired access token",
      error: "UNAUTHORIZED",
    };
    res.status(401).json(response);
  }
};

/**
 * Middleware to handle optional authentication
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    let token = JwtUtils.extractTokenFromHeader(authHeader);

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = JwtUtils.verifyAccessToken(token);
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
        };
      } catch (error) {
        // Token is invalid, but we continue without authentication
        req.user = undefined;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
