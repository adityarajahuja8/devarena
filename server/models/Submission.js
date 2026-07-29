import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    // Who submitted (team leader)
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    problemStatement: {
      type: String,
      required: [true, 'Problem statement is required'],
    },
    solutionDescription: {
      type: String,
      required: [true, 'Solution description is required'],
    },
    githubRepo: { type: String, default: '' },
    liveDemo: { type: String, default: '' },
    techStack: [{ type: String }],
    screenshots: [{ type: String }], // Cloudinary URLs
    presentationPDF: { type: String, default: '' }, // Cloudinary URL
    demoVideoLink: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'UnderReview', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    // Judges assigned to review this submission
    assignedJudges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// One submission per team per hackathon
submissionSchema.index({ team: 1, hackathon: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
