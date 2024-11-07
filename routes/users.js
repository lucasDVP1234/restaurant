// routes/users.js
const express = require('express');
const userController = require('../controllers/userController');
const { ensureAuthenticated, ensureStudent, ensureRestaurant } = require('../middlewares/auth');
const router = express.Router();
const upload = require('../middlewares/upload');

// Set Password Route
router.post('/set-password', ensureAuthenticated, userController.setPassword);

// Account Page
router.get('/account', ensureAuthenticated, userController.getAccount);

// GET profile edit page
router.get('/profile', ensureAuthenticated, ensureStudent, userController.getProfile);

// POST profile updates with file uploads
router.post('/profile', ensureAuthenticated, ensureStudent, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'cv', maxCount: 1 }
]), userController.postProfile);

router.get('/profilerestau', ensureAuthenticated, ensureRestaurant, userController.getProfileRestau);

// POST profile updates with file uploads
router.post('/profilerestau', ensureAuthenticated, ensureRestaurant, upload.fields([
  { name: 'restaurantPicture', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), userController.postProfileRestau);

router.get('/rules', (req, res) => {
  res.render('rules');
});

module.exports = router;
