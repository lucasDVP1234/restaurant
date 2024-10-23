// routes/users.js
const express = require('express');
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/auth');
const router = express.Router();

// Set Password Route
router.post('/set-password', ensureAuthenticated, userController.setPassword);

// Account Page
router.get('/account', ensureAuthenticated, userController.getAccount);

module.exports = router;
