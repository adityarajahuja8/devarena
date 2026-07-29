import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    status: {
      type: String,
      enum: ['registered', 'withdrawn'],
      default: 'registered',
    },
  },
  { timestamps: true }
);

// A participant can only register once per hackathon
registrationSchema.index({ participant: 1, hackathon: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
