// config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const Restaurant = require('../models/Restaurant');

module.exports = function(passport) {
  console.log('Starting Passport');
  console.log('Configuring Passport with the following BASE_URL:', process.env.BASE_URL);
  const callbackURL = `${process.env.BASE_URL}/auth/google/callback`;
  console.log('Google OAuth Callback URL:', callbackURL);

  // Local Strategy for Students
  passport.use('student-local', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        email = email.toLowerCase().trim();
        console.log('Authenticating student:', email);

        const student = await Student.findOne({ email: email });
        if (!student) {
          console.log('Student not found');
          return done(null, false, { message: 'Incorrect email.' });
        }

        if (!student.password) {
          console.log('No password set for this student.');
          return done(null, false, { message: 'No password set for this user.' });
        }

        const match = await bcrypt.compare(password, student.password);
        console.log('Password match result:', match);
        if (match) {
          return done(null, { id: student._id, type: 'student' });
        } else {
          console.log('Incorrect password.');
          return done(null, false, { message: 'Incorrect password.' });
        }
      } catch (err) {
        console.error('Error during student authentication:', err);
        return done(err);
      }
    }
  ));

  // Local Strategy for Restaurants
  passport.use('restaurant-local', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        email = email.toLowerCase().trim();
        console.log('Authenticating restaurant:', email);

        const restaurant = await Restaurant.findOne({ email: email });
        if (!restaurant) {
          console.log('Restaurant not found');
          return done(null, false, { message: 'Incorrect email.' });
        }

        if (!restaurant.password) {
          console.log('No password set for this restaurant.');
          return done(null, false, { message: 'No password set for this user.' });
        }

        const match = await bcrypt.compare(password, restaurant.password);
        console.log('Password match result:', match);
        if (match) {
          return done(null, { id: restaurant._id, type: 'restaurant' });
        } else {
          console.log('Incorrect password.');
          return done(null, false, { message: 'Incorrect password.' });
        }
      } catch (err) {
        console.error('Error during restaurant authentication:', err);
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, { id: user.id, type: user.type });
  });

  passport.deserializeUser(async (user, done) => {
    
    try {
      if (user.type === 'student') {
        const student = await Student.findById(user.id);
        if (student) {
          // Convert to plain object
          const userObject = student.toObject();
          userObject.userType = 'student';
          return done(null, userObject);
        }
      } else if (user.type === 'restaurant') {
        const restaurant = await Restaurant.findById(user.id);
        if (restaurant) {
          // Convert to plain object
          const userObject = restaurant.toObject();
          userObject.userType = 'restaurant';
          return done(null, userObject);
        }
      }
      done(new Error('User not found during deserialization'));
    } catch (err) {
      done(err);
    }
  });
};
