// controllers/userController.js
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const Restaurant = require('../models/Restaurant');
const Job = require('../models/Job');

exports.setPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.send('Passwords do not match.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    if (req.user.userType === 'student') {
      await Student.findByIdAndUpdate(req.user._id, { password: hashedPassword });
    } else if (req.user.userType === 'restaurant') {
      await Restaurant.findByIdAndUpdate(req.user._id, { password: hashedPassword });
    }

    console.log('Password updated for user:', req.user._id);
    res.redirect('/account');
  } catch (err) {
    console.error('Error setting password:', err);
    res.send('Error setting password.');
  }
};

exports.getAccount = async (req, res) => {
  try {
    const user = req.user;

    // Fetch jobs based on user type
    let jobs = [];
    if (user.userType === 'restaurant') {
      jobs = await Job.find({ createdBy: user._id })
        .populate('applicants', 'firstName lastName email')
        .populate('selectedApplicant', '_id');

      res.render('account-restaurant', { user, jobs });
    } else if (user.userType === 'student') {
      jobs = await Job.find({ applicants: user._id })
        .populate('createdBy', 'name')
        .populate('selectedApplicant', '_id');

      res.render('account-student', { user, jobs });
    } else {
      res.status(400).send('Invalid user type.');
    }
  } catch (err) {
    console.error('Error fetching account data:', err);
    res.status(500).send('Error fetching account data.');
  }
};
