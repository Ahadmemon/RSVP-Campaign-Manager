import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'PAUSED'],
      default: 'DRAFT',
    },
    stats: {
      totalInvitees: { type: Number, default: 0 },
      confirmed: { type: Number, default: 0 },
      declined: { type: Number, default: 0 },
      undecided: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
