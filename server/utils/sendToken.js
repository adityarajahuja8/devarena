import jwt from 'jsonwebtoken';

/**
 * Issues a JWT token and sets it as an httpOnly cookie.
 * @param {object} user - Mongoose User document
 * @param {number} statusCode - HTTP status code
 * @param {object} res - Express response object
 * @param {string} message - Success message
 */
export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = jwt.sign(
    { id: user._id, role: user.role, status: user.status },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };

  // Strip password from response
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;

  res.status(statusCode).cookie('hacksphere_token', token, cookieOptions).json({
    success: true,
    message,
    data: { user: userObj, token },
  });
};
