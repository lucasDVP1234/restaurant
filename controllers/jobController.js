// controllers/jobController.js
const Job = require('../models/Job');
const Student = require('../models/Student');
const Restaurant = require('../models/Restaurant');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getJobs = async (req, res) => {
  try {
    const {
      missionTypes,
      contractTypes,
      minAge,
      remunerationMin,
      remunerationMax,
      dateStart,
      dateEnd,
      cities
    } = req.query;
    const studentId = req.user._id.toString();
    let filter = {};

    // Mission Type Filter
    if (missionTypes) {
      const missionTypeArray = missionTypes.split(',');
      filter.mission = { $in: missionTypeArray };
    }

    // City Type Filter
    if (cities) {
      const cityArray = cities.split(',');
      // Find restaurants in the selected cities
      const restaurantsInCities = await Restaurant.find({ city: { $in: cityArray } }).select('_id');
      const restaurantIds = restaurantsInCities.map((r) => r._id);
      if (!filter.createdBy) {
        filter.createdBy = {};
      }
      filter.createdBy.$in = restaurantIds;
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

    // Fetch jobs with populated 'createdBy' including ratings
    const jobs = await Job.find(filter)
      .sort({ _id: -1 })
      .populate('createdBy', 'name logoUrl restaurantPictureUrl addresses city email emergencyPhone ratings')
      .populate('selectedApplicant', '_id')
      .populate('applicants', '_id'); // Populate applicants

    // Compute average rating and prepare job data for rendering
    const jobsWithRatings = jobs.map(job => {
      const restaurant = job.createdBy;
      const averageRating = restaurant.calculateAverageRating();

      // Convert applicants and selectedApplicant to strings for consistent comparison
      const applicantIds = job.applicants.map(applicant => applicant._id.toString());
      const selectedApplicantId = job.selectedApplicant ? job.selectedApplicant._id.toString() : null;

      return {
        ...job.toObject(),
        applicants: applicantIds, // Store applicants as string IDs
        selectedApplicant: selectedApplicantId, // Store selectedApplicant as string ID
        createdBy: {
          ...restaurant.toObject(),
          averageRating: averageRating.toFixed(2) // Round to two decimals
        }
      };
    });

    // Fetch distinct cities from the restaurants for dynamic filter buttons
    const citiesList = await Restaurant.distinct('city');

    res.render('jobs', { jobs: jobsWithRatings, cities: citiesList, studentId });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).send('Server Error');
  }
};

exports.getjobsById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate('createdBy', 'name email');

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
    const students = await Student.find({}, 'email');
    const emails = students.map(student => student.email);

    // Prepare the email message
    const msg = {
      to: emails,
      from: 'lucasdavalpommier@scalevision.fr', // Replace with your verified sender
      subject: '[JobSter] - Nouveau Job Posté',
      text: `Un nouveau job a été posté: ${newJob.createdBy.name}`,
      html: `<p>Un nouveau job a été posté: <strong>${newJob.createdBy.name}</strong></p>`,
    };
    await sgMail.sendMultiple(msg);

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
      city,
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
      city,
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
    console.log('1');

    // Ensure only students can apply
    if (req.user.userType !== 'student') {
      return res.status(403).send('Only students can apply to jobs.');
    }
    console.log('2');

    const job = await Job.findById(jobId)
    .populate('createdBy', 'name email');
    console.log('3');

    if (!job) {
      return res.status(404).send('Job not found.');
    }
    console.log('4');

    // Check if the user has already applied
    if (job.applicants.includes(userId)) {
      return res.redirect('/my-applications');
    }
    

    console.log('5');
    console.log(job.createdBy.email);

    const msg = {
      to: job.createdBy.email,
      from: 'lucasdavalpommier@scalevision.fr',
      subject: 'Un nouvel étudiant a postuler pour votre Job ! ',
      text: `${req.user.firstName} ${req.user.lastName} a postulé pour votre job : ${job.description}`,
      html: `<p>${req.user.firstName} ${req.user.lastName} a postulé pour votre job : <strong>${job.description}</strong></p>`,
    };
    await sgMail.send(msg);
    console.log('6');

    // Add the user to the applicants array
    job.applicants.push(userId);
    await job.save();
    console.log('7');

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
      .populate('applicants', 'firstName lastName number age description cvUrl pastExperience currentSituation availability email profilePictureUrl ratings')
      .populate('selectedApplicant', '_id');

    if (!job) {
      return res.status(404).send('Job not found or you are not authorized to view applicants.');
    }
    const applicantsWithRatings = await Promise.all(
      job.applicants.map(async (applicant) => {
        const student = await Student.findById(applicant._id);
        const averageRating = student.calculateAverageRating();
        return {
          ...applicant.toObject(),
          averageRating
        };
      })
    );


    const applicants = job.applicants;

    res.render('applicants', { job, applicants: applicantsWithRatings });
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

    // Fetch the student's email
    const student = await Student.findById(applicantId);
    const studentEmail = student.email;

    // Prepare the email
    const msg = {
      to: studentEmail,
      from: 'lucasdavalpommier@scalevision.fr',
      subject: 'Vous avez été séléctionné pour le Job ! ',
      text: `Félicitation ! Vous avez été séléctionné pour un job : ${job.description}`,
      html: `<p>Félicitation ! Vous avez été séléctionné pour un job : <strong>${job.description}</strong></p>`,
    };

    // Send the email
    await sgMail.send(msg);

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
    .populate('createdBy', 'name restaurantPictureUrl logoUrl addresses emergencyPhone ratings');


    res.render('restaurantJobs', { jobs });
  } catch (err) {
    console.error('Error fetching restaurant jobs:', err);
    
    res.redirect('/account');
  }
};


exports.getAppliedJobs = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find all jobs where the student is in the applicants array
    const jobs = await Job.find({ applicants: studentId })
      .sort({ _id: -1 })
      .populate('createdBy', 'name logoUrl restaurantPictureUrl addresses emergencyPhone ratings')
      .populate('selectedApplicant', '_id');
    
    const jobsWithRatings = jobs.map(job => {
      const restaurant = job.createdBy;
      const averageRating = restaurant.calculateAverageRating();
      
      return {
        ...job.toObject(),
        createdBy: {
          ...restaurant.toObject(),
          averageRating: averageRating.toFixed(2) // Round to two decimals
        }
      };
    });



    res.render('studentJobs', { jobs : jobsWithRatings, studentId });
  } catch (error) {
    console.error('Error fetching applied jobs:', error.message);
    
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

exports.getFavoriteRestaurantJobs = async (req, res) => {
  try {
    const studentId = req.user._id.toString(); // Convert to string

    // Step 1: Find all jobs where the student has been selected
    const pastJobs = await Job.find({ selectedApplicant: studentId }).populate('createdBy');

    // Step 2: Extract unique restaurant IDs
    const favoriteRestaurantIds = [...new Set(pastJobs.map(job => job.createdBy._id.toString()))];

    // Step 3: Find all upcoming jobs from these restaurants
    const now = new Date();
    const favoriteJobs = await Job.find({
      createdBy: { $in: favoriteRestaurantIds },
      dateAndTime: { $gte: now }, // Only upcoming jobs
    })
      .populate('selectedApplicant', '_id')
      .populate('applicants', '_id')
      .populate('createdBy', 'name logoUrl restaurantPictureUrl addresses city emergencyPhone ratings');

    // Step 4: Format the applicants and selectedApplicant fields
    const jobsWithRatings = favoriteJobs.map(job => {
      const restaurant = job.createdBy;
      const averageRating = restaurant.calculateAverageRating();

      // Convert applicants and selectedApplicant to strings for consistent comparison
      const applicantIds = job.applicants.map(applicant => applicant._id.toString());
      const selectedApplicantId = job.selectedApplicant ? job.selectedApplicant._id.toString() : null;

      return {
        ...job.toObject(),
        applicants: applicantIds, // Use string IDs for applicants
        selectedApplicant: selectedApplicantId, // Use string ID for selectedApplicant
        createdBy: {
          ...restaurant.toObject(),
          averageRating: averageRating.toFixed(2) // Round to two decimals
        }
      };
    });

    // Render the view with favoriteJobs including averageRating
    res.render('favorite-jobs', { jobs: jobsWithRatings, studentId });
  } catch (err) {
    console.error('Error fetching favorite restaurant jobs:', err);
    res.status(500).send('Internal Server Error');
  }
};

exports.rateStudent = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { rating } = req.body;

    // Authorization check
    if (req.user.userType !== 'restaurant') {
      return res.status(403).send('Only restaurants can rate students.');
    }

    const job = await Job.findById(jobId).populate('selectedApplicant');
    if (!job) return res.status(404).send('Job not found.');

    // Ensure the job is completed
    const now = new Date();
    if (job.dateAndTime > now) {
      return res.status(400).send('Cannot rate before job completion.');
    }

    // Check if rating already exists
    if (job.ratingByRestaurant != null) {
      return res.status(400).send('You have already rated this student.');
    }

    // Update job and student rating
    job.ratingByRestaurant = rating;
    await job.save();

    const student = await Student.findById(job.selectedApplicant._id);
    student.ratings.push(rating);
    await student.save();

    res.redirect('/account');
  } catch (error) {
    console.error('Error rating student:', error);
    res.status(500).send('Error rating student.');
  }
};

// Student rates Restaurant
exports.rateRestaurant = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { rating } = req.body;

    // Authorization check
    if (req.user.userType !== 'student') {
      return res.status(403).send('Only students can rate restaurants.');
    }

    const job = await Job.findById(jobId).populate('createdBy');
    if (!job) return res.status(404).send('Job not found.');

    // Ensure the student is the selected applicant
    if (String(job.selectedApplicant) !== String(req.user._id)) {
      return res.status(403).send('You cannot rate this restaurant.');
    }

    // Ensure the job is completed
    const now = new Date();
    if (job.dateAndTime > now) {
      return res.status(400).send('Cannot rate before job completion.');
    }

    // Check if rating already exists
    if (job.ratingByStudent != null) {
      return res.status(400).send('You have already rated this restaurant.');
    }

    // Update job and restaurant rating
    job.ratingByStudent = rating;
    await job.save();

    const restaurant = await Restaurant.findById(job.createdBy._id);
    restaurant.ratings.push(rating);
    await restaurant.save();

    res.redirect('/account');
  } catch (error) {
    console.error('Error rating restaurant:', error);
    res.status(500).send('Error rating restaurant.');
  }
};