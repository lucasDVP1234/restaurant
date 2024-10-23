// controllers/authController.js
const passport = require('passport');
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const Restaurant = require('../models/Restaurant');

exports.getLoginStudent = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  res.render('login-student'); // Create this view
};

exports.postLoginStudent = (req, res, next) => {
  passport.authenticate('student-local', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return next(err);
    }
    if (!user) {
      console.log('Authentication failed:', info.message);
      return res.send(`Login failed: ${info.message}`);
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      return res.redirect('/account');
    });
  })(req, res, next);
};

exports.getLoginRestaurant = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  res.render('login-restaurant'); // Create this view
};

exports.postLoginRestaurant = (req, res, next) => {
  passport.authenticate('restaurant-local', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return next(err);
    }
    if (!user) {
      console.log('Authentication failed:', info.message);
      return res.send(`Login failed: ${info.message}`);
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      return res.redirect('/account');
    });
  })(req, res, next);
};

exports.getSignupStudent = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  res.render('signup-student'); // Create this view
};

exports.postSignupStudent = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const emailLower = email.toLowerCase().trim();

    // Check if email already exists
    const existingStudent = await Student.findOne({ email: emailLower });
    if (existingStudent) {
      return res.send('An account with this email already exists. Please log in or use a different email.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new Student({
      firstName,
      lastName,
      email: emailLower,
      password: hashedPassword,
    });

    await newStudent.save();

    // Authenticate the user after successful signup
    req.logIn({ id: newStudent._id, type: 'student' }, function (err) {
      if (err) {
        console.error(err);
        return res.redirect('/');
      }
      return res.redirect('/account');
    });
  } catch (err) {
    console.error('Error during signup:', err);
    res.send('An error occurred during signup. Please try again.');
  }
};

exports.getSignupRestaurant = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  res.render('signup-restaurant'); // Create this view
};

exports.postSignupRestaurant = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const emailLower = email.toLowerCase().trim();

    // Check if email already exists
    const existingRestaurant = await Restaurant.findOne({ email: emailLower });
    if (existingRestaurant) {
      return res.send('An account with this email already exists. Please log in or use a different email.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newRestaurant = new Restaurant({
      name,
      email: emailLower,
      password: hashedPassword,
    });

    await newRestaurant.save();

    // Authenticate the user after successful signup
    req.logIn({ id: newRestaurant._id, type: 'restaurant' }, function (err) {
      if (err) {
        console.error(err);
        return res.redirect('/');
      }
      return res.redirect('/account');
    });
  } catch (err) {
    console.error('Error during signup:', err);
    res.send('An error occurred during signup. Please try again.');
  }
};

// Handle Logout
exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      console.error('Logout error:', err);
      return next(err);
    }
    res.redirect('/');
  });
};

// Google OAuth Callback (Needs adjustment for separate models)
exports.googleCallback = async (req, res) => {
  res.redirect('/account');
};
