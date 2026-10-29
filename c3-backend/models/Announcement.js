import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['today_session', 'broadcast'],
      default: 'broadcast',
      required: true,
    },
    title: { type: String, required: true },
    topic: { type: String }, // For today's session
    handledBy: { type: String }, // For today's session
    time: { type: String }, // e.g. "1:05 PM - 1:35 PM"
    startTime: { type: String }, // "HH:mm" 24h IST
    endTime: { type: String }, // "HH:mm" 24h IST (optional)
    status: {
      type: String,
      enum: ['scheduled', 'cancelled'],
      default: 'scheduled',
    },
    cancelReason: { type: String, default: '' },
    editedAt: { type: Date },
    venue: { type: String }, // e.g. "CSE Seminar Hall"
    message: { type: String }, // For broadcasts or session agenda
    isActive: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },
    reminderSentAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

announcementSchema.index({ type: 1, isActive: 1, date: -1 });
announcementSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model('Announcement', announcementSchema);
