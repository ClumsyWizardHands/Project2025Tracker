const jwt = require('jsonwebtoken');
const { User } = require('../models');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// In-memory token blacklist (should be replaced with Redis in production)
const tokenBlacklist = new Set();

// In-memory password reset tokens (should be replaced with database storage in production)
const passwordResetTokens = new Map();

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: {
          message: 'Username or email already exists',
          status: 400,
        },
      });
    }

    // Validate role (only admins can create admin accounts)
    if (role === 'admin' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        error: {
          message: 'Only administrators can create admin accounts',
          status: 403,
        },
      });
    }

    // Create user with validated role
    const userRole = role && req.user && req.user.role === 'admin' 
      ? role 
      : 'user'; // Default to 'user' role

    const user = await User.create({
      username,
      email,
      password, // Will be hashed by the model hook
      first_name,
      last_name,
      role: userRole,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user data and tokens
    return res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
        tokens: {
          access: accessToken,
          refresh: refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: {
        message: 'Error registering user',
        status: 500,
      },
    });
  }
};

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if username or email is provided
    if (!username && !email) {
      return res.status(400).json({
        error: {
          message: 'Username or email is required',
          status: 400,
        },
      });
    }

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [
          { username: username || '' },
          { email: email || '' }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401,
        },
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          status: 401,
        },
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user data and tokens
    return res.status(200).json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
        tokens: {
          access: accessToken,
          refresh: refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: {
        message: 'Error logging in',
        status: 500,
      },
    });
  }
};

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: {
          message: 'Refresh token is required',
          status: 400,
        },
      });
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(refresh_token)) {
      return res.status(401).json({
        error: {
          message: 'Invalid refresh token',
          status: 401,
        },
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        error: {
          message: 'Invalid or expired refresh token',
          status: 401,
        },
      });
    }

    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User not found',
          status: 401,
        },
      });
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Blacklist old refresh token
    tokenBlacklist.add(refresh_token);

    // Return new tokens
    return res.status(200).json({
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          access: accessToken,
          refresh: refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      error: {
        message: 'Error refreshing token',
        status: 500,
      },
    });
  }
};

/**
 * Logout a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.logout = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (refresh_token) {
      // Add refresh token to blacklist
      tokenBlacklist.add(refresh_token);
    }

    // Get the access token from the authorization header
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        // Add access token to blacklist
        tokenBlacklist.add(token);
      }
    }

    return res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: {
        message: 'Error logging out',
        status: 500,
      },
    });
  }
};

/**
 * Get current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404,
        },
      });
    }

    return res.status(200).json({
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      error: {
        message: 'Error getting current user',
        status: 500,
      },
    });
  }
};

/**
 * Update current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, first_name, last_name, password } = req.body;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404,
        },
      });
    }

    // Check if username or email already exists
    if (username || email) {
      const existingUser = await User.findOne({
        where: {
          [User.sequelize.Op.and]: [
            { id: { [User.sequelize.Op.ne]: userId } },
            {
              [User.sequelize.Op.or]: [
                { username: username || '' },
                { email: email || '' }
              ]
            }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          error: {
            message: 'Username or email already exists',
            status: 400,
          },
        });
      }
    }

    // Update user
    if (username) user.username = username;
    if (email) user.email = email;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (password) user.password = password; // Will be hashed by the model hook

    await user.save();

    return res.status(200).json({
      message: 'User updated successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Update current user error:', error);
    return res.status(500).json({
      error: {
        message: 'Error updating user',
        status: 500,
      },
    });
  }
};

/**
 * Request password reset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          message: 'Email is required',
          status: 400,
        },
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({
        message: 'If the email exists, a password reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Store token in memory (should be stored in database in production)
    passwordResetTokens.set(resetToken, {
      userId: user.id,
      expiry: resetTokenExpiry,
    });

    // Create reset URL
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`;

    // Send email (mock implementation - should use a real email service in production)
    console.log(`Password reset link: ${resetUrl}`);

    // In a real implementation, you would send an email like this:
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset',
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    */

    return res.status(200).json({
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      error: {
        message: 'Error requesting password reset',
        status: 500,
      },
    });
  }
};

/**
 * Reset password with token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: {
          message: 'Token and password are required',
          status: 400,
        },
      });
    }

    // Verify token
    const resetData = passwordResetTokens.get(token);
    if (!resetData || resetData.expiry < Date.now()) {
      return res.status(400).json({
        error: {
          message: 'Invalid or expired token',
          status: 400,
        },
      });
    }

    // Find user
    const user = await User.findByPk(resetData.userId);
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          status: 404,
        },
      });
    }

    // Update password
    user.password = password; // Will be hashed by the model hook
    await user.save();

    // Remove token
    passwordResetTokens.delete(token);

    return res.status(200).json({
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      error: {
        message: 'Error resetting password',
        status: 500,
      },
    });
  }
};

/**
 * Generate access token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
  );
};
