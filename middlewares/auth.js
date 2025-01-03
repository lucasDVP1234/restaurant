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
function profileCompleteStudent(req, res, next) {
  
  if (req.user && req.user.number && req.user.cvUrl && req.user.contractWanted) {
    return next();
  } else {
    res.redirect('/profile');
  }
}
function profileCompleteRestau(req, res, next) {
  
  if (req.user && req.user.emergencyPhone) {
    return next();
  } else {
    res.redirect('/profilerestau');
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

module.exports = { ensureAuthenticated, ensureStudent, ensureRestaurant, isAdmin,profileCompleteStudent,profileCompleteRestau };
