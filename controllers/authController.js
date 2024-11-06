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
      console.error('Erreur d\'authentification :', err);
      req.flash('error', 'Une erreur est survenue lors de l\'authentification.');
      return next(err);
    }
    if (!user) {
      console.log('Échec de l\'authentification :', info.message);
      req.flash('error', info.message || 'Adresse e-mail ou mot de passe incorrect.');
      return res.redirect('/login/student');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Erreur lors de la connexion :', err);
        req.flash('error', 'Une erreur est survenue lors de la connexion.');
        return next(err);
      }
      req.flash('success', 'Connexion réussie !');
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
      req.flash('error', 'Email ou mot de passe incorrect.');
      return res.redirect('/login/restaurant');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Erreur lors de la connexion :', err);
        req.flash('error', 'Une erreur est survenue lors de la connexion.');
        return next(err);
      }
      req.flash('success', 'Connexion réussie !');
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

    // Vérifier si l'e-mail existe déjà
    const existingStudent = await Student.findOne({ email: emailLower });
    if (existingStudent) {
      req.flash('error', 'Un compte avec cet e-mail existe déjà. Veuillez vous connecter ou utiliser un autre e-mail.');
      return res.redirect('/signup/student');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new Student({
      firstName,
      lastName,
      email: emailLower,
      password: hashedPassword,
    });

    await newStudent.save();

    // Authentifier l'utilisateur après une inscription réussie
    req.logIn({ id: newStudent._id, type: 'student' }, function (err) {
      if (err) {
        console.error(err);
        req.flash('error', 'Une erreur est survenue lors de la connexion.');
        return res.redirect('/');
      }
      req.flash('success', 'Inscription réussie !');
      return res.redirect('/account');
    });
  } catch (err) {
    console.error('Erreur lors de l\'inscription :', err);
    req.flash('error', 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
    res.redirect('/signup/student');
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
      req.flash('error', 'Un compte avec cet e-mail existe déjà. Veuillez vous connecter ou utiliser un autre e-mail.');
      return res.redirect('/signup/restaurant');
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
        req.flash('error', 'Une erreur est survenue lors de la connexion.');
        return res.redirect('/');
      }
      req.flash('success', 'Inscription réussie !');
      return res.redirect('/account');
    });
  } catch (err) {
    req.flash('error', 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
    res.redirect('/signup/restaurant');
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
