import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token)
 */
router.post("/refresh", AuthController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticateToken, AuthController.logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout user from all devices
 * @access  Private
 */
router.post("/logout-all", authenticateToken, AuthController.logoutAll);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticateToken, AuthController.getProfile);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify if user is authenticated
 * @access  Private
 */
router.get("/verify", authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    data: {
      authenticated: true,
      user: req.user,
    },
  });
});

export default router;
