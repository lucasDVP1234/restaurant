// controllers/userController.js
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const Restaurant = require('../models/Restaurant');
const Job = require('../models/Job');
const path = require('path');
const fs = require('fs');

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
// Render the profile edit page
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    res.render('editStudentProfile', { student });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    
    res.redirect('/account');
  }
};

exports.postProfile = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await Student.findById(studentId);

    if (!student) {
      
      return res.redirect('/account');
    }

    // Update fields
    student.firstName = req.body.firstName;
    student.lastName = req.body.lastName;
    student.age = req.body.age;
    student.description = req.body.description;
    student.currentSituation = req.body.currentSituation;
    student.pastExperience = req.body.pastExperience
      ? req.body.pastExperience.split('\n').map(s => s.trim()).filter(s => s)
      : [];
    student.availability = req.body.availability
      ? req.body.availability.split('\n').map(s => s.trim()).filter(s => s)
      : [];

    // Handle uploaded files
    if (req.files) {
      // Profile Picture
      if (req.files.profilePicture) {
        // Save new profile picture URL
        student.profilePictureUrl = req.files.profilePicture[0].location; // S3 file URL
      }

      // CV
      if (req.files.cv) {
        // Save new CV URL
        student.cvUrl = req.files.cv[0].location; // S3 file URL
      }
    }

    await student.save();

    
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating student profile:', error);
    
    res.redirect('/profile');
  }
};

exports.getProfileRestau = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    res.render('editRestaurantProfile', { restaurant });
  } catch (error) {
    console.error('Error fetching restaurant profile:', error);
    
    res.redirect('/account');
  }
};

// Handle profile updates
exports.postProfileRestau = async (req, res) => {
  try {
    const restaurantId = req.user._id;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      req.flash('error_msg', 'Restaurant non trouvé.');
      return res.redirect('/account');
    }

    // Update fields
    restaurant.name = req.body.name;
    restaurant.managerName = req.body.managerName;
    restaurant.emergencyPhone = req.body.emergencyPhone;
    restaurant.siren = req.body.siren;
    restaurant.addresses = req.body.addresses
      ? req.body.addresses.split('\n').map(s => s.trim()).filter(s => s)
      : [];

    // Handle uploaded files
    if (req.files) {
      // Restaurant Picture
      if (req.files.restaurantPicture) {
        // Save new restaurant picture URL
        restaurant.restaurantPictureUrl = req.files.restaurantPicture[0].location; // S3 file URL
      }

      // Logo
      if (req.files.logo) {
        // Save new logo URL
        restaurant.logoUrl = req.files.logo[0].location; // S3 file URL
      }
    }

    await restaurant.save();

    
    res.redirect('/profilerestau');
  } catch (error) {
    console.error('Error updating restaurant profile:', error);
    
    res.redirect('/profilerestau');
  }
};