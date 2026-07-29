import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    /**
     * scores is a flexible Map keyed by criterion name (matches Hackathon.judgingCriteria[].name).
     * e.g. { "Innovation": { marks: 18, comment: "Very novel idea" }, "UI": { marks: 15, comment: "..." } }
     */
    scores: {
      type: Map,
      of: {
        marks: { type: Number, required: true, min: 0 },
        comment: { type: String, default: '' },
      },
      default: {},
    },
    // Aggregated total (calculated on save)
    totalScore: { type: Number, default: 0 },
    generalFeedback: { type: String, default: '' },
    isSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per judge per submission
reviewSchema.index({ submission: 1, judge: 1 }, { unique: true });

// Auto-calculate totalScore before saving
reviewSchema.pre('save', function () {
  let total = 0;
  if (this.scores && this.scores.size > 0) {
    for (const [, val] of this.scores) {
      total += val.marks || 0;
    }
  }
  this.totalScore = total;
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
