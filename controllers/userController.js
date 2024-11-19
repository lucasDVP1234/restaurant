// controllers/userController.js
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const Restaurant = require('../models/Restaurant');
const Job = require('../models/Job');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');


exports.setPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.send('Passwords do not match.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    if (req.user.userType === 'student') {
      await Student.findByIdAndUpdate(req.user._id, { password: hashedPassword });
    } else if (req.user.userType === 'restaurant') {
      await Restaurant.findByIdAndUpdate(req.user._id, { password: hashedPassword });
    }

    console.log('Password updated for user:', req.user._id);
    res.redirect('/account');
  } catch (err) {
    console.error('Error setting password:', err);
    res.send('Error setting password.');
  }
};

exports.getAccount = async (req, res) => {
  try {
    const user = req.user;

    // Fetch jobs based on user type
    let jobs = [];
    if (user.userType === 'restaurant') {
      jobs = await Job.find({ createdBy: user._id })
        .sort({ _id: -1 })
        .populate('applicants', 'firstName lastName email ratings')
        .populate('selectedApplicant', '_id');
      
      const restaurant = await Restaurant.findById(user._id);
      averageRating = restaurant.calculateAverageRating();

    
      res.render('account-restaurant', { user, jobs, averageRating });
    } else if (user.userType === 'student') {
      jobs = await Job.find({ applicants: user._id })
        .sort({ _id: -1 })
        .populate('createdBy', 'name addresses city emergencyPhone ratings')
        .populate('selectedApplicant', '_id');
      
      const student = await Student.findById(user._id);
      averageRating = student.calculateAverageRating();



      res.render('account-student', { user, jobs });
    } else {
      res.status(400).send('Invalid user type.');
    }
  } catch (err) {
    console.error('Error fetching account data:', err);
    res.status(500).send('Error fetching account data.');
  }
};
// Render the profile edit page
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    res.render('editStudentProfile', { student });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    
    res.redirect('/account');
  }
};

exports.postProfile = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await Student.findById(studentId);

    if (!student) {
      
      return res.redirect('/account');
    }

    // Update fields
    student.firstName = req.body.firstName;
    student.lastName = req.body.lastName;
    student.number = req.body.number;
    student.age = req.body.age;
    student.description = req.body.description;
    student.currentSituation = req.body.currentSituation;
    student.pastExperience = req.body.pastExperience
    student.availability = req.body.availability
    student.city = req.body.city
      

    // Handle uploaded files
    if (req.files) {
      // Profile Picture
      if (req.files.profilePicture) {
        // Save new profile picture URL
        student.profilePictureUrl = req.files.profilePicture[0].location; // S3 file URL
      }

      // CV
      if (req.files.cv) {
        // Save new CV URL
        student.cvUrl = req.files.cv[0].location; // S3 file URL
      }
    }

    await student.save();

    
    res.redirect('/rules');
  } catch (error) {
    console.error('Error updating student profile:', error);
    
    res.redirect('/profile');
  }
};

exports.getProfileRestau = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user._id);
    res.render('editRestaurantProfile', { restaurant });
  } catch (error) {
    console.error('Error fetching restaurant profile:', error);
    
    res.redirect('/account');
  }
};

// Handle profile updates
exports.postProfileRestau = async (req, res) => {
  try {
    const restaurantId = req.user._id;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {

      return res.redirect('/account');
    }

    // Update fields
    restaurant.name = req.body.name;
    restaurant.managerName = req.body.managerName;
    restaurant.emergencyPhone = req.body.emergencyPhone;
    restaurant.siren = req.body.siren;
    restaurant.city = req.body.city;
    restaurant.addresses = req.body.addresses
      ? req.body.addresses.split('\n').map(s => s.trim()).filter(s => s)
      : [];

    // Handle uploaded files
    if (req.files) {
      // Restaurant Picture
      if (req.files.restaurantPicture) {
        // Save new restaurant picture URL
        restaurant.restaurantPictureUrl = req.files.restaurantPicture[0].location; // S3 file URL
      }

      // Logo
      if (req.files.logo) {
        // Save new logo URL
        restaurant.logoUrl = req.files.logo[0].location; // S3 file URL
      }
    }

    await restaurant.save();

    
    res.redirect('/account');
  } catch (error) {
    console.error('Error updating restaurant profile:', error);
    
    res.redirect('/profilerestau');
  }
};

exports.renderForgotPassword = (req, res) => {
  res.render('forgot-password');
};

exports.handleForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
      // Find user by email
      let user = await Student.findOne({ email });
      let userType = 'student';

      if (!user) {
          user = await Restaurant.findOne({ email });
          userType = 'restaurant';
      }

      if (!user) {
          // No user found with that email
          req.flash('error_messages', 'Aucun compte associé à cet email.');
          return res.redirect('/forgot-password');
      }

      // Generate a reset token
      const token = crypto.randomBytes(20).toString('hex');

      // Set token and expiration on user
      user.passwordResetToken = token;
      user.passwordResetExpires = Date.now() + 3600000; // 1 hour

      await user.save();

      // Send email via SendGrid
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const resetUrl = `https://jobster-student.fr/reset-password/${token}`;
      console.log(user.email)
      const msg = {
          to: user.email,
          from: 'contact@jobster-student.fr',
          subject: '[JobSter] - Réinitialisation du mot de passe',
          text: `Vous recevez cet email parce que vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.\n\n
          Veuillez cliquer sur le lien suivant, ou copiez-le dans votre navigateur pour compléter le processus dans l'heure qui suit:\n\n
          ${resetUrl}\n\n
          Si vous n'avez pas demandé ceci, veuillez ignorer cet email et votre mot de passe restera inchangé.\n`
      };

      await sgMail.send(msg);

      req.flash('success', 'Un email a été envoyé à ' + user.email + ' avec les instructions pour réinitialiser votre mot de passe.');
      
      res.redirect('/login/student');
  } catch (err) {
      console.error('Error in handleForgotPassword:', err);
      req.flash('error', 'Une erreur est survenue lors de la demande de réinitialisation du mot de passe.');
      res.redirect('/forgot-password');
  }
};

exports.renderResetPassword = async (req, res) => {
  const { token } = req.params;
  try {
      // Find user with the token and not expired
      let user = await Student.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });

      if (!user) {
          user = await Restaurant.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });
      }

      if (!user) {
          req.flash('error', 'Le lien de réinitialisation du mot de passe est invalide ou a expiré.');
          return res.redirect('/forgot-password');
      }

      // Render the reset password form
      res.render('reset-password', { token });
  } catch (err) {
      console.error('Error in renderResetPassword:', err);
      req.flash('error', 'Une erreur est survenue.');
      res.redirect('/forgot-password');
  }
};

exports.handleResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
      // Find user with the token and not expired
      let user = await Student.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });
      let userType = 'student';

      if (!user) {
          user = await Restaurant.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });
          userType = 'restaurant';
      }

      if (!user) {
          req.flash('error', 'Le lien de réinitialisation du mot de passe est invalide ou a expiré.');
          return res.redirect('/forgot-password');
      }

      // Check if passwords match
      if (password !== confirmPassword) {
          req.flash('error', 'Les mots de passe ne correspondent pas.');
          return res.redirect('back');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password and clear reset token fields
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save();

      // Optionally, automatically log the user in
      req.flash('success', 'Votre mot de passe a été mis à jour. Vous pouvez vous connecter.');
      res.redirect('/login/student');
  } catch (err) {
      console.error('Error in handleResetPassword:', err);
      req.flash('error_messages', 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
      res.redirect('/forgot-password');
  }
};
