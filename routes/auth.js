// routes/auth.js
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const router = express.Router();

// Google OAuth Routes
router.get('/auth/google', (req, res, next) => {
    console.log('Initiating Google OAuth');
    console.log('BASE_URL:', process.env.BASE_URL);
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', (req, res, next) => {
    console.log('Handling Google OAuth Callback');
    console.log('Query Parameters:', req.query);
    next();
}, passport.authenticate('google', { failureRedirect: '/' }), authController.googleCallback);


// Google OAuth Routes (Need adjustment for separate models)

// Student Signup
router.get('/signup/student', authController.getSignupStudent);
router.post('/signup/student', authController.postSignupStudent);

// Restaurant Signup
router.get('/signup/restaurant', authController.getSignupRestaurant);
router.post('/signup/restaurant', authController.postSignupRestaurant);

// Student Login
router.get('/login/student', authController.getLoginStudent);
router.post('/login/student', authController.postLoginStudent);

// Restaurant Login
router.get('/login/restaurant', authController.getLoginRestaurant);
router.post('/login/restaurant', authController.postLoginRestaurant);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
