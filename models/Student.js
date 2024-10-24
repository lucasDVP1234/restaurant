const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  age: Number,
  number: String,
  description: String,
  cvUrl: String,
  profilePictureUrl: String,
  pastExperience: String,
  currentSituation: String,
  availability: String,
  email: { type: String, required: true, unique: true },
  password: String,
});

module.exports = mongoose.model('Student', studentSchema);
