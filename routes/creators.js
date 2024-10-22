// routes/creators.js
const express = require('express');
const creatorController = require('../controllers/creatorController');
const { ensureAuthenticated } = require('../middlewares/auth');
const { ensureStudent } = require('../middlewares/auth');
const { ensureRestaurant } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/auth');
const router = express.Router();

// Creators Page


// Route to display the form to add a new creator (GET request)
router.get('/add', ensureRestaurant, creatorController.getAddCreator);

// Route to handle form submission and add the new creator to the database (POST request)
router.post('/add', ensureRestaurant, creatorController.postAddCreator);

router.get('/creators/edit',ensureRestaurant, creatorController.getEditCreator);

router.post('/creators/edit', ensureRestaurant, creatorController.postEditCreator);

router.get('/creators', ensureAuthenticated, ensureStudent, creatorController.getCreators);

router.get('/creators/:id', ensureAuthenticated, ensureStudent, creatorController.getCreatorsById);

// Route for applying to a job
router.post('/apply/:id', ensureAuthenticated, ensureStudent, creatorController.applyToJob);

// Route to view applicants for a job
router.get('/applicants/:id', ensureAuthenticated, ensureRestaurant, creatorController.getApplicantsForJob);

router.post('/select-applicant/:jobId/:applicantId', ensureAuthenticated, ensureRestaurant, creatorController.selectApplicant);

module.exports = router;


module.exports = router;
