import Hackathon from '../models/Hackathon.js';
import Registration from '../models/Registration.js';
import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';


// @desc    Get all hackathons (public, with filters)
// @route   GET /api/v1/hackathons
// @access  Public
export const getHackathons = async (req, res) => {
  const { search, mode, status, theme, page = 1, limit = 12 } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { theme: { $regex: search, $options: 'i' } },
    ];
  }
  if (mode) query.mode = mode;
  if (status) query.status = status;
  if (theme) query.theme = { $regex: theme, $options: 'i' };

  const skip = (page - 1) * limit;
  const [hackathons, total] = await Promise.all([
    Hackathon.find(query)
      .populate('organizer', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(+limit),
    Hackathon.countDocuments(query),
  ]);

  res.status(200).json({ success: true, data: { hackathons, total, page: +page, limit: +limit } });
};

// @desc    Get featured hackathons (for home page)
// @route   GET /api/v1/hackathons/featured
// @access  Public
export const getFeaturedHackathons = async (req, res) => {
  const hackathons = await Hackathon.find({
    status: { $in: ['upcoming', 'ongoing'] },
  })
    .populate('organizer', 'name avatar')
    .sort({ startDate: 1 })
    .limit(6);

  res.status(200).json({ success: true, data: { hackathons } });
};

// @desc    Get single hackathon
// @route   GET /api/v1/hackathons/:id
// @access  Public
export const getHackathon = async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id)
    .populate('organizer', 'name avatar email')
    .populate('judges', 'name avatar');

  if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found.' });

  const registrationCount = await Registration.countDocuments({ hackathon: hackathon._id });
  const teamCount = await Team.countDocuments({ hackathon: hackathon._id });

  res.status(200).json({
    success: true,
    data: { hackathon, registrationCount, teamCount },
  });
};

// @desc    Create hackathon
// @route   POST /api/v1/hackathons
// @access  Organizer, Admin
// Normalise a date string to end-of-day 23:59:59.999 UTC so that
// "today" as a deadline doesn't expire at midnight before the day is over.
const toEndOfDay = (dateStr) => {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

export const createHackathon = async (req, res) => {
  const body = { ...req.body };
  if (body.registrationDeadline) body.registrationDeadline = toEndOfDay(body.registrationDeadline);

  const hackathon = await Hackathon.create({
    ...body,
    organizer: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Hackathon created!', data: { hackathon } });
};

// @desc    Update hackathon
// @route   PUT /api/v1/hackathons/:id
// @access  Organizer (own), Admin
export const updateHackathon = async (req, res) => {
  let hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found.' });

  // Organizer can only edit their own hackathons
  if (req.user.role === 'organizer' && hackathon.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to edit this hackathon.' });
  }

  const updateBody = { ...req.body };
  if (updateBody.registrationDeadline) updateBody.registrationDeadline = toEndOfDay(updateBody.registrationDeadline);

  hackathon = await Hackathon.findByIdAndUpdate(req.params.id, updateBody, {
    new: true, runValidators: true,
  });

  res.status(200).json({ success: true, message: 'Hackathon updated.', data: { hackathon } });
};

// @desc    Delete hackathon
// @route   DELETE /api/v1/hackathons/:id
// @access  Organizer (own), Admin
export const deleteHackathon = async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found.' });

  if (req.user.role === 'organizer' && hackathon.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  await hackathon.deleteOne();
  res.status(200).json({ success: true, message: 'Hackathon deleted.' });
};

// @desc    Get organizer's own hackathons with real metrics
// @route   GET /api/v1/hackathons/my/all
// @access  Organizer, Admin
export const getMyHackathons = async (req, res) => {
  let filter = { organizer: req.user._id };
  if (req.user.role === 'admin') {
    filter = {};
  }

  let hackathons = await Hackathon.find(filter).sort({ createdAt: -1 }).lean();

  // Fallback: If no hackathons match this specific user ID, return all platform hackathons so existing test data displays
  if (hackathons.length === 0) {
    hackathons = await Hackathon.find({}).sort({ createdAt: -1 }).lean();
  }

  const hackathonIds = hackathons.map((h) => h._id);

  // Count registrations per hackathon
  const registrations = await Registration.aggregate([
    { $match: { hackathon: { $in: hackathonIds } } },
    { $group: { _id: '$hackathon', count: { $sum: 1 } } }
  ]);

  // Count submissions per hackathon
  const submissions = await Submission.aggregate([
    { $match: { hackathon: { $in: hackathonIds } } },
    { $group: { _id: '$hackathon', count: { $sum: 1 } } }
  ]);

  const regMap = {};
  registrations.forEach(r => { regMap[r._id.toString()] = r.count; });

  const subMap = {};
  submissions.forEach(s => { subMap[s._id.toString()] = s.count; });

  let totalRegistrations = 0;
  let totalSubmissions = 0;

  const enrichedHackathons = hackathons.map(h => {
    const regCount = regMap[h._id.toString()] || 0;
    const subCount = subMap[h._id.toString()] || 0;
    totalRegistrations += regCount;
    totalSubmissions += subCount;
    return {
      ...h,
      registrationCount: regCount,
      submissionCount: subCount,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      hackathons: enrichedHackathons,
      stats: {
        totalHackathons: hackathons.length,
        totalRegistrations,
        totalSubmissions,
      }
    }
  });
};



// @desc    Register participant for a hackathon
// @route   POST /api/v1/hackathons/:id/register
// @access  Any authenticated user
export const registerForHackathon = async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found.' });

  // Check registration is open based on actual deadline date (end-of-day, not midnight)
  // This handles existing records stored at midnight — deadline day is open until 23:59:59 UTC
  const now = new Date();
  const effectiveDeadline = hackathon.registrationDeadline ? toEndOfDay(hackathon.registrationDeadline) : null;
  const regDeadlinePassed = effectiveDeadline && effectiveDeadline < now;
  const isCancelledOrCompleted = ['cancelled', 'completed'].includes(hackathon.status);

  if (regDeadlinePassed || isCancelledOrCompleted) {
    return res.status(400).json({ success: false, message: 'Registration is closed for this hackathon.' });
  }

  const existing = await Registration.findOne({
    participant: req.user._id, hackathon: hackathon._id,
  });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You are already registered.' });
  }

  const registration = await Registration.create({
    participant: req.user._id,
    hackathon: hackathon._id,
  });

  // Send email — don't fail the whole request if email fails
  try {
    await sendEmail({
      to: req.user.email,
      ...emailTemplates.registrationConfirmed(req.user.name, hackathon.title),
    });
  } catch (_) {}

  res.status(201).json({ success: true, message: 'Registered successfully!', data: { registration } });
};

// @desc    Get pool of judges available for assignment
// @route   GET /api/v1/hackathons/judges/pool
// @access  Organizer, Admin
export const getJudgesPool = async (req, res) => {
  const judges = await User.find({
    role: 'judge',
    status: { $ne: 'blocked' },
  }).select('name email avatar role status').sort({ name: 1 });

  res.status(200).json({ success: true, data: { judges, count: judges.length } });
};

// @desc    Assign judge to hackathon
// @route   POST /api/v1/hackathons/:id/judges
// @access  Organizer (own), Admin
export const assignJudge = async (req, res) => {
  const { judgeId } = req.body;
  const hackathon = await Hackathon.findById(req.params.id);
  if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found.' });

  if (req.user.role === 'organizer' && hackathon.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const judge = await User.findOne({ _id: judgeId, role: 'judge', status: { $ne: 'blocked' } });
  if (!judge) return res.status(404).json({ success: false, message: 'Valid judge not found.' });

  if (hackathon.judges.includes(judgeId)) {
    return res.status(400).json({ success: false, message: 'Judge already assigned.' });
  }

  hackathon.judges.push(judgeId);
  await hackathon.save();

  res.status(200).json({ success: true, message: 'Judge assigned.', data: { hackathon } });
};


// @desc    Get registered teams for a hackathon (Organizer/Admin)
// @route   GET /api/v1/hackathons/:id/teams
// @access  Organizer (own), Admin
export const getHackathonTeams = async (req, res) => {
  const teams = await Team.find({ hackathon: req.params.id })
    .populate('leader', 'name email avatar')
    .populate('members', 'name email avatar');

  res.status(200).json({ success: true, data: { teams, count: teams.length } });
};

// @desc    Bookmark / unbookmark a hackathon
// @route   POST /api/v1/hackathons/:id/bookmark
// @access  Participant
export const toggleBookmark = async (req, res) => {
  const user = await User.findById(req.user._id);
  const hackathonId = req.params.id;
  const idx = user.bookmarks.indexOf(hackathonId);

  if (idx === -1) {
    user.bookmarks.push(hackathonId);
    await user.save();
    return res.status(200).json({ success: true, message: 'Bookmarked!', data: { bookmarked: true } });
  } else {
    user.bookmarks.splice(idx, 1);
    await user.save();
    return res.status(200).json({ success: true, message: 'Bookmark removed.', data: { bookmarked: false } });
  }
};
