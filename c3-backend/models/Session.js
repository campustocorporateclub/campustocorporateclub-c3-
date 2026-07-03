import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  topic: { type: String, required: true },
  type: { type: String, enum: ['technical', 'non-technical'], required: true },
  handledBy: { type: String, required: true },
  coverImage: { type: String, required: true },
  images: [{ type: String }],
  summary: { type: String },
  absentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);