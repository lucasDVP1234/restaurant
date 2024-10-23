const express = require('express');
const jobController = require('../controllers/jobController');
const { ensureAuthenticated, ensureStudent, ensureRestaurant } = require('../middlewares/auth');
const router = express.Router();


// View all jobs
router.get('/', ensureAuthenticated, ensureStudent, jobController.getJobs);

// Add a new job (restaurants only)
router.get('/add', ensureAuthenticated, ensureRestaurant, jobController.getAddJob);
router.post('/add', ensureAuthenticated, ensureRestaurant, jobController.postAddJob);

// Edit a job (restaurants only)
router.get('/edit', ensureAuthenticated, ensureRestaurant, jobController.getEditJob);
router.post('/edit', ensureAuthenticated, ensureRestaurant, jobController.postEditJob);

// View applicants for a job (restaurants only)
router.get('/applicants/:id', ensureAuthenticated, ensureRestaurant, jobController.getApplicantsForJob);

// Select an applicant (restaurants only)
router.post('/select-applicant/:jobId/:applicantId', ensureAuthenticated, ensureRestaurant, jobController.selectApplicant);

// Apply to a job (students only)
router.post('/apply/:id', ensureAuthenticated, ensureStudent, jobController.applyToJob);


// View a specific job
router.get('/view/:id', ensureAuthenticated, ensureStudent, jobController.getjobsById);

module.exports = router;