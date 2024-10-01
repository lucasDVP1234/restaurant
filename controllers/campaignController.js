const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Creator = require('../models/Creator');
const User = require('../models/User'); // Add this line


exports.postSelectCreators = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { creatorIds } = req.body;
    if (!creatorIds || creatorIds.length === 0) {
      return res.send('Please select at least one creator.');
    }

    // Ensure creatorIds is an array
    const selectedCreators = Array.isArray(creatorIds) ? creatorIds : [creatorIds];

    const creators = await Creator.find({ _id: { $in: selectedCreators } });
    console.log(creators)

    // Store selected creators in session or pass them to the next view
    req.session.selectedCreators = creators;

    // Store selected creators in session or pass them to the next view
    //req.session.selectedCreators = selectedCreators;

    if (!user.name || !user.job) {
      // Redirect to the campaign details form if user info is incomplete
        return res.render('campaignDetails', { selectedCreators: creators });
    }
    // Render the campaign details page
    res.render('campaignDetails_client', { selectedCreators: creators });
  } catch (err) {
    console.error('Error selecting creators:', err.message);
    next(err); // Pass the error to the next middleware (e.g., error handler)
  }
};


exports.postCreateCampaign = async (req, res) => {
  try {
    const { name, job, budget, campaignDate } = req.body;
    const creatorIds = req.session.selectedCreators;
    const userId = req.user._id;

    

    // Update user with name and job
    await User.findByIdAndUpdate(userId, { name, job });
    // if (!userId) {
    //   // Handle the case where userId is not in the session
    //   return res.redirect('/signup');
    // }

    // Create new campaign with budget and date
    const newCampaign = new Campaign({
      userId,
      creatorIds,
      budget,
      date: campaignDate,
      status: 'Pending',
    });

    await newCampaign.save();

    // Clear selected creators from session
    req.session.selectedCreators = null;

    res.redirect('/account');
  } catch (err) {
    console.error('Error creating campaign:', err.message);
    res.send('Error creating campaign.');
  }
};

// Create Campaign with Selected Creators
// exports.createCampaign = async (req, res) => {
//   try {
//     let { creatorIds } = req.body;

//     // Log to inspect the submitted creatorIds
//     console.log('Submitted creatorIds:', creatorIds);

//     // Check if at least one creator is selected
//     if (!creatorIds || creatorIds.length === 0) {
//       return res.send('Please select at least one creator.');
//     }

//     // Ensure creatorIds is an array
//     if (!Array.isArray(creatorIds)) {
//       creatorIds = [creatorIds]; // If a single creator is selected, make it an array
//     }

//     console.log('creatorIds:', creatorIds);

//     // No need to convert IDs manually; Mongoose will handle casting
//     // Alternatively, if you prefer, you can cast them using mongoose.Types.ObjectId

//     // Create a new campaign with the selected creators
//     const newCampaign = new Campaign({
//       userId: req.user._id,
//       creatorIds: creatorIds, // Use the array of ID strings directly
//       status: 'Pending',
//     });

//     await newCampaign.save();
//     res.redirect('/account');
//   } catch (err) {
//     console.error('Error creating campaign:', err.message);
//     res.send(`Error creating campaign: ${err.message}`);
//   }
// };
