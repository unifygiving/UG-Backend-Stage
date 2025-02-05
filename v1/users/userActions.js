import express from 'express';
import { prisma } from '../../../../db_share.js';
import authnJWT from '../../../../middleware/authn.js';
import addUserToReq from '../../../../middleware/addUserToReq.js';
import bcrypt from 'bcryptjs';
import authz from '../../../../middleware/authz.js';
import { isEmailValid } from '../../../../utils/validation.js';
import { UserStatus } from '../../../../utils/enums.js';
import { generateRandomPassword, getTIMESTAMPTZ } from '../../../../utils/generalUtils.js';
import multer from 'multer';
import {s3, BucketName, uploadImage,} from '../../../../middleware/digitalOceanConfig.js';
import { sendEmailResetPassword } from '../../../../utils/email.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.use(express.json());
let user;

router.delete('/:id', authnJWT, addUserToReq, authz, async (req, res, next) => {
  /*
        #swagger.summary = 'Deletes a user by id'
        #swagger.description = "This performs a soft delete. It does not actually delete the user from the database. Instead, it sets the user status to 'deleted'. Also, the user email is set to 'deleted_user_at_${getTIMESTAMPTZ()}' (Example: deleted_user_at_2023-05-29 20:33:16.331000-07). This is done because we need to get rid of the email address, but it cannot be null, so we set it to something that is useful that also will not show up when searching a user by email.
        #swagger.security = [{ "JWT_authentication": [] }] 
        #swagger.parameters['id'] = {
            in: 'path',
            description: 'The id of the user to be deleted.',
            type: 'string',
            schema: {
                $password: 'bad12345',
            }
        }
    */
  const integerId = Math.round(req.params.id);
  const deletedAt = `deleted_user_at_${getTIMESTAMPTZ()}`;
  const {password} = req.body;

  user = await prisma.users.findFirstOrThrow({
    where:{
      id: integerId
    }
  });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res
      .status(400)
      .json({ message: 'Password incorrect.' });
  }
  
  try {
    await prisma.users.update({
      where: { id: integerId },
      data: {
        status: UserStatus.DELETED,
        email: deletedAt,
      },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(400).json({
        message: 'A user with that id was not found in the database.',
      });
    }
    console.log(error);
    return res.status(500).json({
      message:
        'An error occured while updating the user status in the database.',
    });
  }

  res.json({ message: 'Successfully deleted the user.' });
  /*
        #swagger.responses[200] = { schema: { message: 'Successfully deleted the user.' } }
        #swagger.responses[400] = { schema: { message: '...depends which error occured...' } }
        #swagger.responses[401] = { schema: { message: '...depends which error occured...' } }
        #swagger.responses[403] = { schema: { message: 'Access denied. You can only access your own records. Charity organizations can access their recipients records. This error can also happen if a user id for the requested resource was not found.' } }
        #swagger.responses[500] = { schema: { message: '...depends which error occured...' } }
    */
});

router.put('/picture/:id', authnJWT, addUserToReq, authz, upload.single('image'), uploadImage, async (req, res, next) => {
  /*
    #swagger.summary = 'Upload or update picture'
    #swagger.security = [{ "JWT_authentication": [] }]
    #swagger.parameters['id'] = { 
      description: 'User Id.',
      in: 'path',
      required: true,
      type: 'string'
    }
    #swagger.parameters['image'] = {
      description: 'Image to upload or update.',
      in: 'formData',
      required: true,
      type: 'file'
    }
    #swagger.responses[200] = { schema: { message: 'Successfully uploaded or updated picture.' } }
    #swagger.responses[400] = { schema: { message: '...depends which error occured...' } }
    #swagger.responses[500] = { schema: { message: 'Internal server error' } }
  */

  try {
      const profileId = req.user.id;
      const fileName = req.fileName;

      const user = await prisma.users.findUnique({
        where: { id: profileId },
        select: { picture: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const oldPicture = user.picture;

      if (oldPicture) {
          const deleteParams = {
            Bucket: BucketName,
            Key: oldPicture,
          };

          s3.deleteObject(deleteParams, (error, data) => {
            if (error) {
              console.error('Error deleting old image from Spaces:', error);
              return res.status(500).json({ message: 'Unable to delete old image from DigitalOcean Spaces.' });
            }
          });
      }

      await prisma.users.update({
          where: { id: profileId },
          data: { picture: fileName },
      });

      res.json({ message: 'Successfully uploaded picture.', picture: fileName });

  } catch (error) {
      console.error('Error updating picture:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
  
});

router.post('/reset-password', async (req, res, next) => {
  const { email } = req.body;

  if (!isEmailValid(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const newPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await sendEmailResetPassword(email, newPassword);

    res.status(200).json({ message: 'Password reset successfully. Check your email for the new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while resetting the password.' });
  }
});

export default router;