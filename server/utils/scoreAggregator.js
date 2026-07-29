import Review from '../models/Review.js';
import Submission from '../models/Submission.js';
import Hackathon from '../models/Hackathon.js';

const getMaxMarks = (hackathon) => {
  if (!hackathon?.judgingCriteria?.length) return 100;
  const total = hackathon.judgingCriteria.reduce((sum, c) => sum + (c.maxMarks || 0), 0);
  return total > 0 ? total : 100;
};

const normalizeScore = (rawScore, maxMarks) => {
  if (!maxMarks || maxMarks === 0) return 0;
  return Math.round((rawScore / maxMarks) * 1000) / 10; // 1 decimal
};

/**
 * Aggregate scores + per-criterion breakdown across all judges for a submission.
 */
export const aggregateSubmissionScore = async (submissionId) => {
  const reviews = await Review.find({ submission: submissionId, isSubmitted: true });
  if (!reviews.length) return { rawAvg: 0, criterionBreakdown: {} };

  const totalScores = reviews.map((r) => r.totalScore || 0);
  const rawAvg = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;

  // Aggregate per-criterion marks across judges
  const criterionSums = {};
  const criterionCounts = {};

  for (const review of reviews) {
    const scoresObj = review.scores instanceof Map
      ? Object.fromEntries(review.scores)
      : review.scores || {};

    for (const [key, val] of Object.entries(scoresObj)) {
      const marks = typeof val === 'object' ? Number(val?.marks || 0) : Number(val || 0);
      criterionSums[key] = (criterionSums[key] || 0) + marks;
      criterionCounts[key] = (criterionCounts[key] || 0) + 1;
    }
  }

  // Build average per criterion
  const criterionBreakdown = {};
  for (const key of Object.keys(criterionSums)) {
    criterionBreakdown[key] = Math.round((criterionSums[key] / criterionCounts[key]) * 10) / 10;
  }

  return {
    rawAvg: Math.round(rawAvg * 100) / 100,
    criterionBreakdown,
  };
};

/**
 * Get ranked leaderboard for a hackathon.
 * Returns array sorted by normalized score (out of 100%) descending.
 * Each item includes a per-criterion breakdown.
 */
export const getLeaderboard = async (hackathonId) => {
  const [submissions, hackathon] = await Promise.all([
    Submission.find({ hackathon: hackathonId })
      .populate('team', 'name members leader')
      .lean(),
    Hackathon.findById(hackathonId).lean(),
  ]);

  const maxMarks = getMaxMarks(hackathon);
  const judgingCriteria = hackathon?.judgingCriteria || [];

  const leaderboardData = await Promise.all(
    submissions.map(async (sub) => {
      const { rawAvg, criterionBreakdown } = await aggregateSubmissionScore(sub._id);
      const reviewCount = await Review.countDocuments({ submission: sub._id, isSubmitted: true });
      const averageScore = normalizeScore(rawAvg, maxMarks);

      return {
        submissionId: sub._id,
        projectName: sub.projectName,
        team: sub.team,
        averageScore,          // normalized 0–100%
        rawScore: rawAvg,      // e.g. 53 out of 60
        maxMarks,
        criterionBreakdown,    // { Innovation: 18, 'Technical Complexity': 22, ... }
        judgingCriteria,       // [{ name, maxMarks }, ...]
        reviewCount,
        status: sub.status,
      };
    })
  );

  leaderboardData.sort((a, b) => b.averageScore - a.averageScore);
  return leaderboardData.map((item, idx) => ({ ...item, rank: idx + 1 }));
};
