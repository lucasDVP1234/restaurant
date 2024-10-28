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
  ratings: [{ type: Number, min: 0, max: 5 }],
});

studentSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((a, b) => a + b, 0);
  return sum / this.ratings.length;
};


module.exports = mongoose.model('Student', studentSchema);
