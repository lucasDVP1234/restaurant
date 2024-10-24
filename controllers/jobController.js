// controllers/jobController.js
const Job = require('../models/Job');
const Student = require('../models/Student');
const Restaurant = require('../models/Restaurant');

exports.getJobs = async (req, res) => {
  try {
    const { missionTypes, contractTypes, minAge, remunerationMin, remunerationMax, dateStart, dateEnd } = req.query;

    let filter = {};

    // Mission Type Filter
    if (missionTypes) {
      const missionTypeArray = missionTypes.split(',');
      filter.mission = { $in: missionTypeArray };
    }

    // Contract Type Filter
    if (contractTypes) {
      const contractTypeArray = contractTypes.split(',');
      filter.contractType = { $in: contractTypeArray };
    }

    // Minimum Age Filter
    if (minAge) {
      filter.minAge = { $gte: parseInt(minAge) };
    }

    // Remuneration Filter
    if (remunerationMin || remunerationMax) {
      filter.remuneration = {};
      if (remunerationMin) {
        filter.remuneration.$gte = parseFloat(remunerationMin);
      }
      if (remunerationMax) {
        filter.remuneration.$lte = parseFloat(remunerationMax);
      }
    }

    // Date Filter
    if (dateStart || dateEnd) {
      filter.dateAndTime = {};
      if (dateStart) {
        filter.dateAndTime.$gte = new Date(dateStart);
      }
      if (dateEnd) {
        filter.dateAndTime.$lte = new Date(dateEnd);
      }
    }

    const jobs = await Job.find(filter).populate('createdBy','name logoUrl restaurantPictureUrl addresses emergencyPhone');

    res.render('jobs', { jobs });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).send('Server Error');
  }
};

exports.getjobsById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate('createdBy', 'name');

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
      dateAndTime,
      jobDuration,
      description,
      mission,
      remuneration,
      contractType,
      attireRequired,
      minAge,
      profileType,
    } = req.body;

    const newJob = new Job({
      dateAndTime,
      jobDuration,
      description,
      mission,
      remuneration,
      contractType,
      attireRequired,
      minAge,
      profileType,
      createdBy: req.user._id, // Should be a Restaurant
    });

    await newJob.save();

    res.redirect('/account');
  } catch (err) {
    console.error('Error adding job:', err.message);
    res.status(500).send('Error adding job.');
  }
};

exports.getEditJob = async (req, res) => {
  try {
    const user = req.user;
    const jobs = await Job.find({ createdBy: user._id }, 'description _id');

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
      dateAndTime,
      jobDuration,
      description,
      mission,
      remuneration,
      contractType,
      attireRequired,
      minAge,
      profileType,
    } = req.body;

    const updatedData = {
      dateAndTime,
      jobDuration,
      description,
      mission,
      remuneration,
      contractType,
      attireRequired,
      minAge,
      profileType,
    };

    // Update only if the job belongs to the logged-in restaurant
    await Job.findOneAndUpdate({ _id: jobId, createdBy: user._id }, updatedData);

    res.redirect('/account');
  } catch (error) {
    console.error('Error updating job:', error.message);
    res.status(500).send('Error updating job.');
  }
};

exports.applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id;

    // Ensure only students can apply
    if (req.user.userType !== 'student') {
      return res.status(403).send('Only students can apply to jobs.');
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).send('Job not found.');
    }

    // Check if the user has already applied
    if (job.applicants.includes(userId)) {
      return res.redirect('/jobs');
    }

    // Add the user to the applicants array
    job.applicants.push(userId);
    await job.save();

    res.redirect('/jobs');
  } catch (error) {
    console.error('Error applying to job:', error.message);
    res.status(500).send('Error applying to job.');
  }
};

exports.getApplicantsForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id;

    // Ensure only restaurants can view applicants
    if (req.user.userType !== 'restaurant') {
      return res.status(403).send('Access denied.');
    }

    const job = await Job.findOne({ _id: jobId, createdBy: userId })
      .populate('applicants', 'firstName lastName number age description cvUrl pastExperience currentSituation availability email profilePictureUrl')
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

    // Ensure only restaurants can select applicants
    if (req.user.userType !== 'restaurant') {
      return res.status(403).send('Access denied.');
    }

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

    res.redirect('/applicants/' + jobId);
  } catch (error) {
    console.error('Error selecting applicant:', error.message);
    res.status(500).send('Error selecting applicant.');
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);

    if (!job) {
      
      return res.redirect('/account');
    }

    // Check if the logged-in restaurant is the creator of the job
    if (String(job.createdBy) !== String(req.user._id)) {
      
      return res.redirect('/account');
    }

    await Job.findByIdAndDelete(jobId);

    
    res.redirect('/account');
  } catch (err) {
    console.error('Error deleting job:', err);
    
    res.redirect('/account');
  }
};

exports.getRestaurantJobs = async (req, res) => {
  try {
    // Fetch jobs created by the logged-in restaurant
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ dateAndTime: -1 })
    .populate('createdBy', 'name restaurantPictureUrl logoUrl addresses emergencyPhone');


    res.render('restaurantJobs', { jobs });
  } catch (err) {
    console.error('Error fetching restaurant jobs:', err);
    req.flash('error_msg', 'Une erreur s\'est produite lors du chargement de vos jobs.');
    res.redirect('/account');
  }
};


exports.getAppliedJobs = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find all jobs where the student is in the applicants array
    const jobs = await Job.find({ applicants: studentId })
      .populate('createdBy', 'name logoUrl restaurantPictureUrl addresses emergencyPhone')
      .populate('selectedApplicant', '_id');

    res.render('studentJobs', { jobs, studentId });
  } catch (error) {
    console.error('Error fetching applied jobs:', error.message);
    req.flash('error_msg', 'Une erreur s\'est produite lors du chargement de vos candidatures.');
    res.redirect('/account');
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const studentId = req.user._id.toString();

    // Find the job
    const job = await Job.findById(jobId);

    if (!job) {
      
      return res.redirect('/jobs/my-applications');
    }

    // Check if the student has applied
    if (!job.applicants.includes(studentId)) {
      
      return res.redirect('/jobs/my-applications');
    }

    // Check if the student has been selected
    if (job.selectedApplicant && job.selectedApplicant.toString() === studentId) {
      
      return res.redirect('/jobs/my-applications');
    }

    // Remove the student from the applicants array
    job.applicants.pull(studentId);
    await job.save();

    
    res.redirect('/jobs/my-applications');
  } catch (error) {
    console.error('Error withdrawing application:', error.message);
    
    res.redirect('/jobs/my-applications');
  }
};

exports.deselectApplicant = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    // Ensure only restaurants can deselect applicants
    if (req.user.userType !== 'restaurant') {
      return res.status(403).send('Access denied.');
    }

    // Find the job
    const job = await Job.findOne({ _id: jobId, createdBy: userId });

    if (!job) {
      return res.status(404).send('Job not found or you are not authorized to deselect applicants.');
    }

    // Check if there is a selected applicant
    if (!job.selectedApplicant) {
      return res.status(400).send('No applicant has been selected for this job.');
    }

    // Deselect the applicant
    job.selectedApplicant = null;
    await job.save();

    res.redirect('/applicants/' + jobId);
  } catch (error) {
    console.error('Error deselecting applicant:', error.message);
    res.status(500).send('Error deselecting applicant.');
  }
};