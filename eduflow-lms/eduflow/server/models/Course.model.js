const mongoose = require('mongoose');
const slugify = require('slugify');

const lectureSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  video: {
    public_id: { type: String, default: '' },
    url:       { type: String, default: '' },
    duration:  { type: Number, default: 0 }, // in seconds
  },
  isPreview:   { type: Boolean, default: false },
  order:       { type: Number, required: true },
  resources: [{
    title: String,
    url:   String,
    type:  { type: String, enum: ['pdf', 'link', 'zip', 'other'] },
  }],
}, { timestamps: true });

const sectionSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  order:    { type: Number, required: true },
  lectures: [lectureSchema],
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: [true, 'Course title is required'],
    trim:     true,
    maxlength: [120, 'Title cannot exceed 120 characters'],
  },
  slug: { type: String, unique: true },
  subtitle: {
    type:     String,
    maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    default:  '',
  },
  description: {
    type:     String,
    required: [true, 'Description is required'],
    minlength: [50, 'Description must be at least 50 characters'],
  },
  instructor: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  category: {
    type:     String,
    required: [true, 'Category is required'],
    enum:     [
      'Web Development', 'Mobile Development', 'Data Science',
      'Machine Learning', 'DevOps', 'Cybersecurity', 'Database',
      'Cloud Computing', 'UI/UX Design', 'Programming Languages',
      'Game Development', 'Blockchain', 'Other',
    ],
  },
  level: {
    type:     String,
    required: true,
    enum:     ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
  },
  language: { type: String, default: 'English' },
  thumbnail: {
    public_id: { type: String, default: '' },
    url:       { type: String, default: 'https://via.placeholder.com/800x450/6C63FF/white?text=EduFlow+Course' },
  },
  previewVideo: {
    public_id: { type: String, default: '' },
    url:       { type: String, default: '' },
  },
  price:           { type: Number, required: true, min: 0, default: 0 },
  discountPrice:   { type: Number, default: 0 },
  discountExpiry:  Date,
  isFree:          { type: Boolean, default: false },
  sections:        [sectionSchema],
  requirements:    [{ type: String }],
  learningOutcomes:[{ type: String }],
  tags:            [{ type: String, lowercase: true }],
  status: {
    type:    String,
    enum:    ['draft', 'pending', 'published', 'archived'],
    default: 'draft',
  },
  isApproved:      { type: Boolean, default: false },
  // Analytics
  totalStudents:   { type: Number, default: 0 },
  totalRevenue:    { type: Number, default: 0 },
  avgRating:       { type: Number, default: 0, min: 0, max: 5 },
  totalRatings:    { type: Number, default: 0 },
  totalDuration:   { type: Number, default: 0 }, // in seconds
  totalLectures:   { type: Number, default: 0 },
  // Coupon
  couponCode:      { type: String, default: '' },
  couponDiscount:  { type: Number, default: 0 },
  couponExpiry:    Date,
  featured:        { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// ─── Indexes ─────────────────────────────────────────────────────────
courseSchema.index({ slug: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1, isApproved: 1 });
courseSchema.index({ avgRating: -1 });
courseSchema.index({ totalStudents: -1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// ─── Virtuals ─────────────────────────────────────────────────────────
courseSchema.virtual('reviews', {
  ref:         'Review',
  localField:  '_id',
  foreignField: 'course',
});

courseSchema.virtual('effectivePrice').get(function () {
  if (this.isFree) return 0;
  if (this.discountPrice && this.discountExpiry && new Date() < this.discountExpiry) {
    return this.discountPrice;
  }
  return this.price;
});

// ─── Pre-save ─────────────────────────────────────────────────────────
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.price === 0) this.isFree = true;

  // Calculate totals
  let totalDuration = 0;
  let totalLectures = 0;
  this.sections.forEach(section => {
    section.lectures.forEach(lecture => {
      totalDuration += lecture.video.duration || 0;
      totalLectures++;
    });
  });
  this.totalDuration = totalDuration;
  this.totalLectures = totalLectures;
  next();
});

module.exports = mongoose.model('Course', courseSchema);
