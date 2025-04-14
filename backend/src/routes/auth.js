const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login a user
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 * @access Public (with refresh token)
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout a user
 * @access Private
 */
router.post('/logout', authenticateJWT, authController.logout);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', authenticateJWT, authController.getCurrentUser);

/**
 * @route PUT /api/v1/auth/me
 * @desc Update current user
 * @access Private
 */
router.put('/me', authenticateJWT, authController.updateCurrentUser);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password with token
 * @access Public (with reset token)
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;
