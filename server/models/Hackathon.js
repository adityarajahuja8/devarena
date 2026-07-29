import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    theme: { type: String, required: [true, 'Theme is required'] },
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Hybrid'],
      required: true,
    },
    venue: { type: String, default: '' },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    bannerImage: { type: String, default: '' },
    prizePool: { type: Number, default: 0, min: 1 },
    maxTeamSize: { type: Number, default: 4, min: 1, max: 10 },
    minTeamSize: { type: Number, default: 1, min: 1 },
    rules: { type: String, default: '' },
    // Array of judging criteria (configurable per hackathon)
    judgingCriteria: [
      {
        name: { type: String, required: true },    // e.g., "Innovation"
        maxMarks: { type: Number, required: true }, // e.g., 20
        description: { type: String, default: '' },
      },
    ],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Judges assigned to this hackathon (from approved judge pool)
    judges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
    tags: [{ type: String }],
    websiteUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// Virtual: registration is open if deadline hasn't passed
hackathonSchema.virtual('isRegistrationOpen').get(function () {
  return new Date() < this.registrationDeadline && this.status !== 'cancelled';
});

hackathonSchema.set('toJSON', { virtuals: true });
hackathonSchema.set('toObject', { virtuals: true });

const Hackathon = mongoose.model('Hackathon', hackathonSchema);
export default Hackathon;
