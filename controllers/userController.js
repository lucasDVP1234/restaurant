// controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');

const Creator = require('../models/Creator'); // Import Creator if needed


// Render Signup Page
exports.getSignup = (req, res) => {
  const userType = req.params.userType;
  if (req.isAuthenticated()) {
    return res.redirect('/account');
  }
  res.render('signup', { userType });
};

// Handle Signup
exports.postSignup = async (req, res) => {
  const userType = req.params.userType;
  try {
    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password; // Assuming you're collecting password
    let newUser;

    // Check if the email already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.send('An account with this email already exists. Please log in or use a different email.');
    }

    if (userType === 'restaurant') {
      const companyName = req.body.companyName;
      newUser = new User({
        email: email,
        companyName: companyName,
        userType: 'restaurant',
        password: await bcrypt.hash(password, 10), // Hash the password
      });
    } else if (userType === 'student') {
      const name = req.body.name;
      newUser = new User({
        email: email,
        name: name,
        userType: 'student',
        password: await bcrypt.hash(password, 10), // Hash the password
      });
    } else {
      return res.status(400).send('Invalid user type.');
    }

    const savedUser = await newUser.save();

    // Authenticate the user after successful signup
    req.logIn(savedUser, function (err) {
      if (err) {
        console.error(err);
        return res.redirect('/');
      }
      return res.redirect('/account');
    });
  } catch (err) {
    console.error('Error during signup:', err);
    res.send('An error occurred during signup. Please try again.');
  }
};

// Set Password
exports.setPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.send('Passwords do not match.');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the user's password in the database
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });
    console.log('Password updated for user:', req.user._id);

    console.log('Password set successfully. You can now log in with your email and password.');
    res.redirect('/account');
  } catch (err) {
    console.error('Error setting password:', err);
    res.send('Error setting password.');
  }
};

// Render Account Page
exports.getAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.password) {
      // Redirect to the campaign details form if user info is incomplete
      return res.redirect('/');
    }

    

    // Fetch jobs created by the logged-in restaurant
    let jobs = [];
    if (user.userType === 'restaurant') {
      jobs = await Creator.find({ createdBy: user._id })
        .populate('applicants', 'name email')
        .populate('selectedApplicant', '_id');
    } else if (user.userType === 'student') {
      // Find jobs where the user has applied
      jobs = await Creator.find({ applicants: user._id })
        .populate('createdBy', 'companyName')
        .populate('selectedApplicant', '_id');
    }

    // Render the account page with the campaigns, jobs, and the user info
    res.render('account', { user: req.user, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching campaigns.');
  }
};
