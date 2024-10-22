// middlewares/auth.js

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function ensureProfileComplete(req, res, next) {
  const user = req.user;
  if (user && user.name && user.job) {
    return next();
  } else {
    res.redirect('/account');
  }
}

function ensureStudent(req, res, next) {
  const user = req.user;
  if (user && user.userType ==="student") {
    return next();
  } else {
    res.redirect('/account');
  }
}
function ensureRestaurant(req, res, next) {
  const user = req.user;
  if (user && user.userType ==="restaurant") {
    return next();
  } else {
    res.redirect('/account');
  }
}
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).send('Access denied.');
};

module.exports = { ensureAuthenticated, ensureProfileComplete,isAdmin,ensureStudent,ensureRestaurant };
