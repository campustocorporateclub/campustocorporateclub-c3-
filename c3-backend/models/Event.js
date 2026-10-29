import mongoose from 'mongoose';

const slugify = str =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  category: { type: String },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  coverImage: { type: String, required: true },
  gallery: [{ type: String }],
  summary: { type: String },
  attendeeCount: { type: Number },
  highlights: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate the slug from the title if one wasn't provided explicitly.
eventSchema.pre('save', function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
});

eventSchema.index({ date: 1 });

export default mongoose.model('Event', eventSchema);