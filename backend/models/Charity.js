const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  location: { type: String },
});

const CharitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 200 },
    logo: { type: String, default: '' },
    images: [{ type: String }],
    website: { type: String, default: '' },
    category: {
      type: String,
      enum: ['health', 'education', 'environment', 'sports', 'community', 'other'],
      default: 'other',
    },
    events: [EventSchema],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalReceived: { type: Number, default: 0 },
    subscriberCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug from name
CharitySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Charity', CharitySchema);