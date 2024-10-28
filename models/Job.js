// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  dateAndTime: Date,
  jobDuration: Number, // Duration in hours
  description: String,
  mission: String, // 'ponctuel' or 'récurrent'
  remuneration: Number, // Salary amount
  contractType: String, // 'extra', 'CDD', 'CDI'
  attireRequired: String, // Tenue nécessaire
  minAge: Number,
  profileType: String, // Type de profil recherché
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  selectedApplicant: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  ratingByRestaurant: { type: Number, min: 0, max: 5 }, // Rating given to student
  ratingByStudent: { type: Number, min: 0, max: 5 },    
});

module.exports = mongoose.model('Job', jobSchema);
