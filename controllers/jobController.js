// controllers/jobController.js

const Job = require('../models/Job'); // Ensure this import is present

exports.getjobs = async (req, res) => {
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

        // Fetch jobs based on query
        const jobs = await Job.find(query);

        // Fetch categories and videoTypes for filters
        const categoriesList = await Job.distinct('category');
        const videoTypesList = await Job.distinct('videoTypes');
        const countriesList = await Job.distinct('country');
        const languesList = await Job.distinct('langue');
        const atoutsList = await Job.distinct('atout');
        const genresList = await Job.distinct('genre');

        res.render('jobs', {
            jobs,
            categories: categoriesList,
            videoTypes: videoTypesList,
            countries: countriesList,
            langues: languesList,
            atouts: atoutsList,
            genres: genresList,
        });
    } catch (err) {
        console.error('Error fetching jobs:', err.message);
        res.status(500).send('Server Error');
    }
};

exports.getjobsById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).send('Job not found');
        }

        res.render('job', { job });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getAddJob = async (req, res) => {
    try {
        res.render('addJob');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

  
exports.postAddJob = async (req, res) => {
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
  
      // Create a new Job instance
      const newJob = new Job({
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
  
      await newJob.save();
  
      res.redirect('/account'); // Redirect to the account page
    } catch (err) {
      console.error('Error adding job:', err.message);
      res.status(500).send('Error adding job.');
    }
  };

  exports.getEditJob = async (req, res) => {
    try {
      const user = req.user;
      const jobs = await Job.find({ createdBy: user._id }, 'name _id');
  
      // If a job ID is provided in the query, fetch that job
      let job = null;
      if (req.query.jobId) {
        job = await Job.findOne({ _id: req.query.jobId, createdBy: user._id });
      }
  
      res.render('editJob', {
        jobs,
        job,
      });
    } catch (error) {
      console.error('Error fetching job for edit:', error.message);
      res.status(500).send('Server Error');
    }
  };

  exports.postEditJob = async (req, res) => {
    try {
      const user = req.user;
      const jobId = req.body.jobId;
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
      await Job.findOneAndUpdate({ _id: jobId, createdBy: user._id }, updatedData);
  
      res.redirect('/account'); // Redirect to the account page
    } catch (error) {
      console.error('Error updating job:', error.message);
      res.status(500).send('Error updating job.');
    }
  };

  exports.applyToJob = async (req, res) => {
    try {
      const jobId = req.params.id;
      const userId = req.user._id;
  
      // Find the job
      const job = await Job.findById(jobId);
  
      if (!job) {
        return res.status(404).send('Job not found.');
      }
  
      // Check if the user has already applied
      if (job.applicants.includes(userId)) {
        // Optional: Flash message or inform the user they've already applied
        return res.redirect('/jobs'); // Or wherever appropriate
      }
  
      // Add the user to the applicants array
      job.applicants.push(userId);
      await job.save();
  
      // Optional: Flash message to inform the user of successful application
      res.redirect('/jobs'); // Or wherever appropriate
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
      const job = await Job.findOne({ _id: jobId, createdBy: userId })
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
      const job = await Job.findOne({ _id: jobId, createdBy: userId });
  
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
  
      res.redirect('/jobs/applicants/' + jobId);
    } catch (error) {
      console.error('Error selecting applicant:', error.message);
      res.status(500).send('Error selecting applicant.');
    }
  };