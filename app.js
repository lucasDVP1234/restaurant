// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require("connect-mongo");
const passport = require('passport');
const path = require('path');
const indexRoutes = require('./routes/index');
const app = express();
const jobRoutes = require('./routes/jobs');
const upload = require('./middlewares/upload');
const flash = require('connect-flash'); // Add this line

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI);


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const sessionStore = MongoStore.create({
  client: mongoose.connection.getClient(),
  dbName: 'Plateforme'
});

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
}));

app.use(flash());

// Middleware to make flash messages available in templates
app.use(function (req, res, next) {
  res.locals.success_messages = req.flash('success');
  res.locals.error_messages = req.flash('error');
  next();
});


const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// Passport Configuration
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUrl = req.path;
  next();
});

// Make user object available in all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', indexRoutes);
app.use('/jobs', jobRoutes);


// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
