import Review from '../models/Review.js';
import Submission from '../models/Submission.js';
import Hackathon from '../models/Hackathon.js';
import { getLeaderboard } from '../utils/scoreAggregator.js';

// @desc    Get judge dashboard data
// @route   GET /api/v1/reviews/judge-dashboard
// @access  Judge
export const getJudgeDashboard = async (req, res) => {
  const judgeId = req.user._id;

  // 1. Find all hackathons this judge is assigned to
  const assignedHackathons = await Hackathon.find({ judges: judgeId })
    .populate('organizer', 'name')
    .lean();

  const hackathonIds = assignedHackathons.map((h) => h._id);

  // 2. Find ALL submissions for those hackathons (judge reviews all submissions in their hackathon)
  const submissions = await Submission.find({ hackathon: { $in: hackathonIds } })
    .populate('team', 'name')
    .populate('hackathon', 'title theme judgingCriteria')
    .populate('submittedBy', 'name email')
    .lean();

  // 3. Find all reviews this judge has already submitted
  const myReviews = await Review.find({ judge: judgeId }).lean();
  const reviewedSubmissionIds = new Set(
    myReviews.filter((r) => r.isSubmitted).map((r) => r.submission.toString())
  );

  // 4. Annotate each submission with review status
  const pending = [];
  const completed = [];

  for (const sub of submissions) {
    const reviewed = reviewedSubmissionIds.has(sub._id.toString());
    const myReview = myReviews.find((r) => r.submission.toString() === sub._id.toString());
    if (reviewed) {
      completed.push({ ...sub, myReview });
    } else {
      pending.push({ ...sub, myReview: myReview || null });
    }
  }

  // 5. Compute real average score
  const submittedReviews = myReviews.filter((r) => r.isSubmitted && r.totalScore > 0);
  const avgScore =
    submittedReviews.length > 0
      ? (submittedReviews.reduce((acc, r) => acc + r.totalScore, 0) / submittedReviews.length).toFixed(1)
      : 0;

  res.status(200).json({
    success: true,
    data: {
      assignedHackathons,
      submissions,
      pending,
      completed,
      stats: {
        hackathonsAssigned: assignedHackathons.length,
        totalSubmissions: submissions.length,
        pending: pending.length,
        completed: completed.length,
        avgScore: Number(avgScore),
      },
    },
  });
};

// @desc    Submit or update a review (judge)
// @route   POST /api/v1/reviews
// @access  Judge
export const submitReview = async (req, res) => {
  const { submissionId, hackathonId, scores, generalFeedback, isSubmitted } = req.body;

  // Verify submission exists
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found.' });
  }

  // Verify judge is assigned to the hackathon
  const hackathon = await Hackathon.findById(hackathonId || submission.hackathon);
  if (!hackathon) {
    return res.status(404).json({ success: false, message: 'Hackathon not found.' });
  }

  const isAssigned = hackathon.judges.map((j) => j.toString()).includes(req.user._id.toString());
  if (!isAssigned) {
    return res.status(403).json({ success: false, message: 'You are not assigned to judge this hackathon.' });
  }

  // Manually compute totalScore — findOneAndUpdate skips pre('save') hooks
  let totalScore = 0;
  if (scores) {
    Object.values(scores).forEach((v) => {
      totalScore += Number(v?.marks || 0);
    });
  }

  // Upsert the review
  const review = await Review.findOneAndUpdate(
    { submission: submissionId, judge: req.user._id },
    {
      submission: submissionId,
      judge: req.user._id,
      hackathon: hackathonId || submission.hackathon,
      scores,
      totalScore,
      generalFeedback: generalFeedback || '',
      isSubmitted: isSubmitted || false,
    },
    { new: true, upsert: true, runValidators: true }
  );

  // Emit leaderboard update via Socket.io if submitted
  if (isSubmitted && req.app) {
    const io = req.app.get('io');
    if (io) {
      const leaderboard = await getLeaderboard(hackathonId || submission.hackathon);
      io.to(`hackathon:${hackathonId || submission.hackathon}`).emit('leaderboard:update', leaderboard);
    }
  }

  res.status(200).json({ success: true, message: 'Review saved.', data: { review } });
};

// @desc    Get judge's own review for a submission
// @route   GET /api/v1/reviews/submission/:submissionId
// @access  Judge
export const getMyReview = async (req, res) => {
  const review = await Review.findOne({
    submission: req.params.submissionId,
    judge: req.user._id,
  });

  res.status(200).json({ success: true, data: { review: review || null } });
};

// @desc    Get all reviews for a submission (Organizer/Admin)
// @route   GET /api/v1/reviews/submission/:submissionId/all
// @access  Organizer, Admin
export const getAllReviewsForSubmission = async (req, res) => {
  const reviews = await Review.find({ submission: req.params.submissionId })
    .populate('judge', 'name email avatar');

  res.status(200).json({ success: true, data: { reviews } });
};

// @desc    Get leaderboard for a hackathon
// @route   GET /api/v1/reviews/leaderboard/:hackathonId
// @access  Public
export const getHackathonLeaderboard = async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.hackathonId).select('title status');
  if (!hackathon) {
    return res.status(404).json({ success: false, message: 'Hackathon not found.' });
  }

  const leaderboard = await getLeaderboard(req.params.hackathonId);

  res.status(200).json({ success: true, data: { hackathon, leaderboard } });
};
