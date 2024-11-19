// models/Restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: String,
  managerName: String,
  emergencyPhone: String,
  email: { type: String, required: true, unique: true },
  password: String,
  addresses: [String],
  city: String,
  siren: String,
  restaurantPictureUrl: String,
  logoUrl: String,
  ratings: [{ type: Number, min: 0, max: 5 }],
  passwordResetToken: String,
  passwordResetExpires: Date,
});

restaurantSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((a, b) => a + b, 0);
  return sum / this.ratings.length;
};

module.exports = mongoose.model('Restaurant', restaurantSchema);
