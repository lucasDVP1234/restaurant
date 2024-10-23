// models/Job.js
const mongoose = require('mongoose');

const jobschema = new mongoose.Schema({
  name: String,
  genre: String,
  age: Number,
  category: [String],
  videoTypes: [String],
  profileImage: String,
  portfolioImages: [String],
  description: String,
  country: String,
  langue: [String],
  atout: [String],
  videos: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // New field
  selectedApplicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Job', jobschema);
