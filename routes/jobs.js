const express = require('express');
const jobController = require('../controllers/jobController');
const { ensureAuthenticated, ensureStudent, ensureRestaurant, profileCompleteStudent, profileCompleteRestau } = require('../middlewares/auth');
const router = express.Router();


// View all jobs
router.get('/', ensureAuthenticated, ensureStudent, jobController.getJobs);

// Add a new job (restaurants only)
router.get('/add', ensureAuthenticated, ensureRestaurant, profileCompleteRestau, jobController.getAddJob);
router.post('/add', ensureAuthenticated, ensureRestaurant, profileCompleteRestau, jobController.postAddJob);

// Edit a job (restaurants only)
router.get('/edit', ensureAuthenticated, ensureRestaurant, profileCompleteRestau, jobController.getEditJob);
router.post('/edit', ensureAuthenticated, ensureRestaurant, profileCompleteRestau, jobController.postEditJob);

// View applicants for a job (restaurants only)
router.get('/applicants/:id', ensureAuthenticated, ensureRestaurant, profileCompleteRestau, jobController.getApplicantsForJob);

// Select an applicant (restaurants only)
router.post('/select-applicant/:jobId/:applicantId', ensureAuthenticated, ensureRestaurant,profileCompleteRestau, jobController.selectApplicant);

// Deselect an applicant (restaurants only)
router.post('/deselect-applicant/:jobId', ensureAuthenticated, ensureRestaurant, profileCompleteRestau, jobController.deselectApplicant);


// Apply to a job (students only)
router.post('/apply/:id', ensureAuthenticated, ensureStudent,profileCompleteStudent, jobController.applyToJob);

router.post('/withdraw/:jobId', ensureAuthenticated, ensureStudent, profileCompleteStudent, jobController.withdrawApplication);

router.post('/jobs/:jobId/rate-student', jobController.rateStudent);
router.post('/jobs/:jobId/rate-restaurant', jobController.rateRestaurant);


// View a specific job
router.get('/view/:id', ensureAuthenticated, ensureStudent, jobController.getjobsById);

router.post('/delete/:id', ensureAuthenticated, ensureRestaurant, jobController.deleteJob);

router.get('/my-jobs', ensureAuthenticated, ensureRestaurant, jobController.getRestaurantJobs);

router.get('/my-applications', ensureAuthenticated, ensureStudent, jobController.getAppliedJobs);

router.get('/favorite-jobs', ensureAuthenticated, ensureStudent, jobController.getFavoriteRestaurantJobs);

module.exports = router;