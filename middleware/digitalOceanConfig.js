import aws from 'aws-sdk';
import { isPictureValid } from '../utils/validation.js';


// s3 endpoint for DigitalOcean Space
export const s3 = new aws.S3({
  endpoint: 'ams3.digitaloceanspaces.com',
  credentials: new aws.Credentials(
    'DO00XMHE8XH2ZKJ2LBAL',
    process.env.SPACES_SECRET,
    null
  ),
});

export const BucketName = 'ug-storage';

// Image upload middleware
export const uploadImage = (req, res, next) => {
  const profileId = req.params.id;
  const picture = req.file;
  const fileMimetype = `${picture.mimetype}`;
  const fileName = `${profileId}_${Date.now()}.${fileMimetype.split('/').pop()}`;

  // Validate file type is an image
  if (isPictureValid(picture) === false) {
    return res.status(400).json({
      message:
        'Invalid input for picture. Acceptable image file formats are: png, jpg, jpeg.',
    });
  }

  // Define params needed to upload image to Spaces
  let uploadParams = {
    Bucket: BucketName,
    Body: req.file.buffer,
    ACL: 'public-read',
    Key: fileName,
  };

  // Upload image to Spaces
  s3.upload(uploadParams, function (error, data) {
    if (error) {
      return res.status(500).json({
        message: 'Unable to upload image to DigitalOcean Spaces.',
      });
    }
  });

  // Make fileName available in request 
  req.fileName = `https://ug-storage.ams3.digitaloceanspaces.com/${fileName}`;
  next();
};

export const uploadImageToSpaces = async (file) => {
  const fileMimetype = `${file.mimetype}`;
  const fileName = `${Date.now()}.${fileMimetype.split('/').pop()}`;

  const uploadParams = {
    Bucket: BucketName,
    Body: file.buffer,
    ACL: 'public-read',
    Key: fileName,
  };

  return new Promise((resolve, reject) => {
    s3.upload(uploadParams, (error, data) => {
      if (error) {
        return reject('Unable to upload image to DigitalOcean Spaces.');
      }
      resolve(`https://ug-storage.ams3.digitaloceanspaces.com/${fileName}`);
    });
  });
};