// routes/jobs.js
const express = require('express');
const jobController = require('../controllers/jobController');
const { ensureAuthenticated } = require('../middlewares/auth');
const { ensureStudent } = require('../middlewares/auth');
const { ensureRestaurant } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/auth');
const router = express.Router();

// jobs Page


// Route to display the form to add a new job (GET request)
router.get('/add', ensureRestaurant, jobController.getAddJob);

// Route to handle form submission and add the new job to the database (POST request)
router.post('/add', ensureRestaurant, jobController.postAddJob);

router.get('/jobs/edit',ensureRestaurant, jobController.getEditJob);

router.post('/jobs/edit', ensureRestaurant, jobController.postEditJob);

router.get('/jobs', ensureAuthenticated, ensureStudent, jobController.getjobs);

router.get('/jobs/:id', ensureAuthenticated, ensureStudent, jobController.getjobsById);

// Route for applying to a job
router.post('/apply/:id', ensureAuthenticated, ensureStudent, jobController.applyToJob);

// Route to view applicants for a job
router.get('/applicants/:id', ensureAuthenticated, ensureRestaurant, jobController.getApplicantsForJob);

router.post('/select-applicant/:jobId/:applicantId', ensureAuthenticated, ensureRestaurant, jobController.selectApplicant);

module.exports = router;


module.exports = router;
