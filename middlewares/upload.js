require('dotenv').config();
const multer = require('multer');
const multerS3 = require('multer-s3-v3');
const { S3Client } = require('@aws-sdk/client-s3');

// Configure AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize upload middleware with S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'public-read', // Adjust according to your requirements
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileExtension = file.originalname.split('.').pop();
      const filename = `${req.user._id}-${Date.now()}.${fileExtension}`;
      let folder = '';
      if (file.fieldname === 'profilePicture' || file.fieldname === 'restaurantPicture') {
        folder = 'restaurant_pictures/';
      } else if (file.fieldname === 'cv') {
        folder = 'cvs/';
      } else if (file.fieldname === 'logo') {
        folder = 'logos/';
      }
      cb(null, folder + filename);
    },
  }),
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'profilePicture' || file.fieldname === 'restaurantPicture' || file.fieldname === 'logo') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Veuillez télécharger une image.'));
      }
    } else if (file.fieldname === 'cv') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Veuillez télécharger un fichier PDF pour le CV.'));
      }
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

module.exports = upload;
