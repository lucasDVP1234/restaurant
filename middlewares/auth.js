// middlewares/auth.js

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function ensureStudent(req, res, next) {
  
  if (req.user && req.user.userType === 'student') {
    return next();
  } else {
    res.redirect('/account');
  }
}

function ensureRestaurant(req, res, next) {

  if (req.user && req.user.userType === 'restaurant') {
    
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
}

module.exports = { ensureAuthenticated, ensureStudent, ensureRestaurant, isAdmin };
