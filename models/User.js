// models/User.js
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  companyName: String,
  googleId: String,
  password: String,
  job: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  userType: { type: String, enum: ['student', 'restaurant'], required: true },
});

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);
