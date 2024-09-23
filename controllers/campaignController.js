const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Creator = require('../models/Creator');

// Create Campaign with Selected Creators
exports.createCampaign = async (req, res) => {
  try {
    let { creatorIds } = req.body;

    // Log to inspect the submitted creatorIds
    console.log('Submitted creatorIds:', creatorIds);

    // Check if at least one creator is selected
    if (!creatorIds || creatorIds.length === 0) {
      return res.send('Please select at least one creator.');
    }

    // Ensure creatorIds is an array
    if (!Array.isArray(creatorIds)) {
      creatorIds = [creatorIds]; // If a single creator is selected, make it an array
    }

    console.log('creatorIds:', creatorIds);

    // No need to convert IDs manually; Mongoose will handle casting
    // Alternatively, if you prefer, you can cast them using mongoose.Types.ObjectId

    // Create a new campaign with the selected creators
    const newCampaign = new Campaign({
      userId: req.user._id,
      creatorIds: creatorIds, // Use the array of ID strings directly
      status: 'Pending',
    });

    await newCampaign.save();
    res.redirect('/account');
  } catch (err) {
    console.error('Error creating campaign:', err.message);
    res.send(`Error creating campaign: ${err.message}`);
  }
};
