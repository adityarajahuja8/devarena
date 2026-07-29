import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware: Verify JWT from httpOnly cookie or Authorization header.
 * Attaches req.user to the request on success.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Try httpOnly cookie first
  if (req.cookies && req.cookies.hacksphere_token) {
    token = req.cookies.hacksphere_token;
  }
  // 2. Fallback: Authorization header (Bearer token)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Always fetch fresh user from DB (catches blocked users)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

/**
 * Middleware: Restrict route to specific roles.
 * Usage: authorize('admin', 'organizer')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

/**
 * Middleware: Ensure organizer/judge has been approved by Admin.
 * Must be used AFTER protect.
 */
export const requireApproved = (req, res, next) => {
  if (
    (req.user.role === 'organizer' || req.user.role === 'judge') &&
    req.user.status !== 'approved'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending admin approval. Please wait.',
    });
  }
  next();
};
