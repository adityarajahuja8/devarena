import User from '../models/User.js';
import { sendTokenResponse } from '../utils/sendToken.js';

// @desc    Register new user
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Only allow these roles via signup; admin must be seeded
  const allowedRoles = ['participant', 'organizer', 'judge'];
  const userRole = allowedRoles.includes(role) ? role : 'participant';

  // Check for existing user
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  }

  const user = await User.create({ name, email, password, role: userRole });

  // If organizer or judge → status is 'pending' (set by model pre-save hook)
  // Return minimal info without token (they must wait for approval)
  if (user.role === 'organizer' || user.role === 'judge') {
    return res.status(201).json({
      success: true,
      message: `Your ${userRole} account has been created and is pending Admin approval. We'll notify you when it's approved.`,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
    });
  }

  // Participant: immediately issue token
  sendTokenResponse(user, 201, res, 'Registration successful! Welcome to HackSphere.');
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
  }

  // Organizer/Judge pending
  if (user.status === 'pending') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending admin approval.',
      data: { status: 'pending', role: user.role },
    });
  }

  sendTokenResponse(user, 200, res, 'Login successful!');
};

// @desc    Logout
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.cookie('hacksphere_token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('bookmarks', 'title bannerImage startDate');
  res.status(200).json({ success: true, data: { user } });
};

// @desc    Update profile
// @route   PUT /api/v1/auth/me
// @access  Private
export const updateProfile = async (req, res) => {
  const allowedFields = ['name', 'bio', 'skills', 'github', 'linkedin', 'avatar'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: 'Profile updated.', data: { user } });
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password changed successfully.');
};
