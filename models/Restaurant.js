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
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
