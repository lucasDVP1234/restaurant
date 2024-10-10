// routes/creators.js
const express = require('express');
const creatorController = require('../controllers/creatorController');
const { ensureAuthenticated } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/auth');
const router = express.Router();

// Creators Page


// Route to display the form to add a new creator (GET request)
router.get('/add', isAdmin, creatorController.getAddCreator);

// Route to handle form submission and add the new creator to the database (POST request)
router.post('/add', isAdmin, creatorController.postAddCreator);

router.get('/creators/edit', creatorController.getEditCreator);

router.post('/creators/edit', creatorController.postEditCreator);

router.get('/creators', ensureAuthenticated, creatorController.getCreators);

router.get('/creators/:id', ensureAuthenticated, creatorController.getCreatorsById);



module.exports = router;
