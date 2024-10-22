// controllers/creatorController.js

const Creator = require('../models/Creator'); // Ensure this import is present

exports.getCreators = async (req, res) => {
    try {
        const { categories, videoTypes, ageMin, ageMax, countries, langues, atouts, genres } = req.query;

        // Build query object
        let query = {};

        if (categories) {
            query.category = { $in: categories.split(',') };
        }

        if (videoTypes) {
            query.videoTypes = { $in: videoTypes.split(',') };
        }

        if (ageMin || ageMax) {
            query.age = {};
            if (ageMin) query.age.$gte = parseInt(ageMin);
            if (ageMax) query.age.$lte = parseInt(ageMax);
        }

        if (countries) {
            query.country = { $in: countries.split(',') };
        }
        if (langues) {
            query.langue = { $in: langues.split(',') };
        }
        if (atouts) {
            query.atout = { $in: atouts.split(',') };
        }
        if (genres) {
            query.genre = { $in: genres.split(',') };
        }

        // Fetch creators based on query
        const creators = await Creator.find(query);

        // Fetch categories and videoTypes for filters
        const categoriesList = await Creator.distinct('category');
        const videoTypesList = await Creator.distinct('videoTypes');
        const countriesList = await Creator.distinct('country');
        const languesList = await Creator.distinct('langue');
        const atoutsList = await Creator.distinct('atout');
        const genresList = await Creator.distinct('genre');

        res.render('creators', {
            creators,
            categories: categoriesList,
            videoTypes: videoTypesList,
            countries: countriesList,
            langues: languesList,
            atouts: atoutsList,
            genres: genresList,
        });
    } catch (err) {
        console.error('Error fetching creators:', err.message);
        res.status(500).send('Server Error');
    }
};

exports.getCreatorsById = async (req, res) => {
    try {
        const creatorId = req.params.id;
        const creator = await Creator.findById(creatorId);

        if (!creator) {
            return res.status(404).send('Creator not found');
        }

        res.render('creator', { creator });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getAddCreator = async (req, res) => {
    try {
        res.render('addCreator');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

  
exports.postAddCreator = async (req, res) => {
    try {
      const {
        name,
        age,
        country,
        langue,
        profileImage,
        portfolioImages,
        videoTypes,
        category,
        genre,
        atout,
        videos,
      } = req.body;
  
      // Create a new Creator instance
      const newCreator = new Creator({
        name,
        age,
        country,
        langue,
        profileImage,
        genre,
        portfolioImages: portfolioImages.split(',').filter(Boolean),
        videoTypes: videoTypes.split(',').filter(Boolean),
        category: category.split(',').filter(Boolean),
        atout: atout.split(',').filter(Boolean),
        videos: videos.split(',').filter(Boolean),
        createdBy: req.user._id, // Associate job with the logged-in restaurant
      });
  
      await newCreator.save();
  
      res.redirect('/account'); // Redirect to the account page
    } catch (err) {
      console.error('Error adding creator:', err.message);
      res.status(500).send('Error adding creator.');
    }
  };

  exports.getEditCreator = async (req, res) => {
    try {
      const user = req.user;
      const creators = await Creator.find({ createdBy: user._id }, 'name _id');
  
      // If a creator ID is provided in the query, fetch that creator
      let creator = null;
      if (req.query.creatorId) {
        creator = await Creator.findOne({ _id: req.query.creatorId, createdBy: user._id });
      }
  
      res.render('editCreator', {
        creators,
        creator,
      });
    } catch (error) {
      console.error('Error fetching creator for edit:', error.message);
      res.status(500).send('Server Error');
    }
  };

  exports.postEditCreator = async (req, res) => {
    try {
      const user = req.user;
      const creatorId = req.body.creatorId;
      const {
        name,
        age,
        country,
        langue,
        profileImage,
        portfolioImages,
        videoTypes,
        category,
        genre,
        atout,
        videos,
      } = req.body;
  
      const updatedData = {
        name,
        age,
        country,
        langue,
        profileImage,
        genre,
        portfolioImages: portfolioImages.split(',').filter(Boolean),
        videoTypes: videoTypes.split(',').filter(Boolean),
        category: category.split(',').filter(Boolean),
        atout: atout.split(',').filter(Boolean),
        videos: videos.split(',').filter(Boolean),
      };
  
      // Update only if the job belongs to the logged-in restaurant
      await Creator.findOneAndUpdate({ _id: creatorId, createdBy: user._id }, updatedData);
  
      res.redirect('/account'); // Redirect to the account page
    } catch (error) {
      console.error('Error updating creator:', error.message);
      res.status(500).send('Error updating creator.');
    }
  };

  exports.applyToJob = async (req, res) => {
    try {
      const jobId = req.params.id;
      const userId = req.user._id;
  
      // Find the job
      const job = await Creator.findById(jobId);
  
      if (!job) {
        return res.status(404).send('Job not found.');
      }
  
      // Check if the user has already applied
      if (job.applicants.includes(userId)) {
        // Optional: Flash message or inform the user they've already applied
        return res.redirect('/creators'); // Or wherever appropriate
      }
  
      // Add the user to the applicants array
      job.applicants.push(userId);
      await job.save();
  
      // Optional: Flash message to inform the user of successful application
      res.redirect('/creators'); // Or wherever appropriate
    } catch (error) {
      console.error('Error applying to job:', error.message);
      res.status(500).send('Error applying to job.');
    }
  };
  
  // Get applicants for a job
  exports.getApplicantsForJob = async (req, res) => {
    try {
      const jobId = req.params.id;
      const userId = req.user._id;
  
      // Find the job, ensure it belongs to the logged-in restaurant
      const job = await Creator.findOne({ _id: jobId, createdBy: userId })
        .populate('applicants', 'name email')
        .populate('selectedApplicant', '_id');
  
      if (!job) {
        return res.status(404).send('Job not found or you are not authorized to view applicants.');
      }
  
      const applicants = job.applicants;
  
      res.render('applicants', { job, applicants });
    } catch (error) {
      console.error('Error fetching applicants:', error.message);
      res.status(500).send('Error fetching applicants.');
    }
  };

  exports.selectApplicant = async (req, res) => {
    try {
      const { jobId, applicantId } = req.params;
      const userId = req.user._id;
  
      // Find the job, ensure it belongs to the logged-in restaurant
      const job = await Creator.findOne({ _id: jobId, createdBy: userId });
  
      if (!job) {
        return res.status(404).send('Job not found or you are not authorized to select applicants.');
      }
  
      // Ensure the applicant is in the job's applicants list
      if (!job.applicants.includes(applicantId)) {
        return res.status(400).send('Applicant not found for this job.');
      }
  
      // Update the job's selectedApplicant field
      job.selectedApplicant = applicantId;
      await job.save();
  
      // Optional: Send notification to the applicant (not implemented here)
  
      res.redirect('/creators/applicants/' + jobId);
    } catch (error) {
      console.error('Error selecting applicant:', error.message);
      res.status(500).send('Error selecting applicant.');
    }
  };