const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['seeker', 'employer'], required: true },
    // Seeker-specific
    resumeSummary: { type: String, default: '' },
    skills: { type: [String], default: [] },
    // Employer-specific
    companyName: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
