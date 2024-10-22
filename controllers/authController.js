// controllers/authController.js
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.getLogin = (req, res) => {
  const userType = req.params.userType;
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  res.render('login', { userType });
};

// Handle Local Login
exports.postLogin = (req, res, next) => {
  const userType = req.params.userType;
  req.body.userType = userType; // Add userType to the request body for passport
  passport.authenticate('local', (err, user, info) => {
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

// Google OAuth Callback
exports.googleCallback = async (req, res) => {
  if (!req.user.userType) {
    // Redirect to a page where the user can select their role
    return res.redirect('/set-role');
  }
  res.redirect('/account');
};
