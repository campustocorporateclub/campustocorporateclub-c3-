import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'coordinator', 'member'], default: 'member' },
  year: { type: Number },
  section: { type: String, trim: true },
  registerNumber: { type: String, trim: true },
  isApproved: { type: Boolean, default: false },
  attendanceStartDate: { type: Date },
  attendanceStartSetBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendanceStartSetAt: { type: Date },
  mustChangePassword: { type: Boolean, default: false },
  passwordChangedAt: { type: Date },
}, { timestamps: true });

userSchema.index({ role: 1, isApproved: 1 });
userSchema.index({ isApproved: 1 });

export default mongoose.model('User', userSchema);