const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: {
        message: 'Access denied. No token provided.',
        status: 401,
      },
    });
  }

  // Format: "Bearer [token]"
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Check if token is about to expire and issue a new one if needed
    const tokenExp = decoded.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = tokenExp - currentTime;
    
    // If token will expire in less than 15 minutes (900 seconds), add a new token to the response
    if (timeUntilExpiration < 900) {
      const newToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
      res.setHeader('X-New-Token', newToken);
    }
    
    next();
  } catch (error) {
    return res.status(403).json({
      error: {
        message: 'Invalid or expired token.',
        status: 403,
      },
    });
  }
};

/**
 * Middleware to check if user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      error: {
        message: 'Access denied. Admin privileges required.',
        status: 403,
      },
    });
  }
};

/**
 * Middleware to check if user has researcher role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isResearcher = (req, res, next) => {
  if (req.user && req.user.role === 'researcher') {
    next();
  } else {
    return res.status(403).json({
      error: {
        message: 'Access denied. Researcher privileges required.',
        status: 403,
      },
    });
  }
};

/**
 * Middleware to check if user has researcher role or higher
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isResearcherOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'researcher' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      error: {
        message: 'Access denied. Researcher privileges required.',
        status: 403,
      },
    });
  }
};

/**
 * Middleware to check if user is the owner of the resource or an admin
 * @param {Function} getResourceOwnerId - Function to get the owner ID of the resource
 * @returns {Function} Middleware function
 */
const isOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // If user is admin, allow access
      if (req.user.role === 'admin') {
        return next();
      }

      // Get the owner ID of the resource
      const ownerId = await getResourceOwnerId(req);

      // If user is the owner, allow access
      if (req.user.id === ownerId) {
        return next();
      }

      // Otherwise, deny access
      return res.status(403).json({
        error: {
          message: 'Access denied. You do not have permission to access this resource.',
          status: 403,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: {
          message: 'Internal server error.',
          status: 500,
        },
      });
    }
  };
};

module.exports = {
  authenticateJWT,
  isAdmin,
  isResearcher,
  isResearcherOrAdmin,
  isOwnerOrAdmin,
};
