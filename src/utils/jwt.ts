import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload, RefreshTokenPayload } from "../types/auth";

export class JwtUtils {
  private static accessSecret = process.env.JWT_ACCESS_SECRET!;
  private static refreshSecret = process.env.JWT_REFRESH_SECRET!;
  private static accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  private static refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
    const options: SignOptions = {
      expiresIn: this.accessExpiresIn as any,
    };
    return jwt.sign(payload, this.accessSecret, options);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(
    payload: Omit<RefreshTokenPayload, "iat" | "exp">
  ): string {
    const options: SignOptions = {
      expiresIn: this.refreshExpiresIn as any,
    };
    return jwt.sign(payload, this.refreshSecret, options);
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.accessSecret) as JwtPayload;
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as RefreshTokenPayload;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  /**
   * Get token expiration date
   */
  static getTokenExpiration(expiresIn: string): Date {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      throw new Error("Invalid expiration format");
    }

    const value = parseInt(match[1]!);
    const unit = match[2]!;

    switch (unit) {
      case "s":
        return new Date(now.getTime() + value * 1000);
      case "m":
        return new Date(now.getTime() + value * 60 * 1000);
      case "h":
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case "d":
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        throw new Error("Invalid time unit");
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }
}
