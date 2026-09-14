import mongoose from 'mongoose';

const TranscriptMessageSchema = new mongoose.Schema({
  speaker: {
    type: String,
    enum: ['AI_AGENT', 'INVITEE', 'SYSTEM'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const InviteeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Invitee name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          // E.164 format validation: starts with +, followed by 1 to 15 digits
          return /^\+[1-9]\d{1,14}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid E.164 phone number! Example format: +14155552671`,
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'DECLINED', 'UNDECIDED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    callDuration: {
      type: Number,
      default: 0, // In seconds
    },
    callId: {
      type: String,
      default: null,
    },
    lastCalledAt: {
      type: Date,
      default: null,
    },
    disposition: {
      type: String,
      default: null,
    },
    transcript: [TranscriptMessageSchema],
  },
  {
    timestamps: true,
  }
);

// Composite index to ensure phone uniqueness per campaign
InviteeSchema.index({ campaignId: 1, phone: 1 }, { unique: true });

export default mongoose.models.Invitee || mongoose.model('Invitee', InviteeSchema);
