// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const jobRoutes = require('./jobs');

// Home Route
router.get('/', async (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  res.render('set-role');
});

// Use other routers
router.use('/', authRoutes);
router.use('/', userRoutes);
router.use('/', jobRoutes);

module.exports = router;
