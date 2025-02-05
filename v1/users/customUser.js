import express from 'express';
import { prisma } from '../../../../db_share.js';
import { Prisma } from '@prisma/client';
import authnJWT from '../../../../middleware/authn.js';
import addUserToReq from '../../../../middleware/addUserToReq.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import authz from '../../../../middleware/authz.js';
import {
  isEmailValid,
  isPasswordValid,
  isNameValid,
  isAgreeToTermsValid,
  isRoleValid,
  isIntroductionValid,
} from '../../../../utils/validation.js';
import { sendEmailVerification } from '../../../../utils/email.js';
import { UserStatus } from '../../../../utils/enums.js';
import { customUserLogin } from '../../../../controllers/usersController.js';

const router = express.Router();
router.use(express.json());
let user;

router.post('/', async (req, res, next) => {
  /*
        #swagger.summary = 'Creates new user and sends verification email'
        #swagger.description = "The 'charity_id_recipient' field is only used when registering recipient users (in order to link them to their charity organization). Otherwise, you do not need to include that in the request body. The 'role' field must be one of ['donor', 'recipient', 'charity']. Use an email address you have access to, so that you can complete the registration process."
        #swagger.parameters['Request body'] = {
            in: 'body',
            schema: {
                $firstName: 'John',
                $lastName: 'Doe',
                $email: 'john@email.com',
                $password: 'bad12345',
                $agreeToTerms: true,
                $role: 'donor',
                $city: 'London',
                $country: 'Uk',
            }
        }
    */
  const {
    firstName,
    lastName,
    email,
    password,
    agreeToTerms,
    role,
    city,
    country
  } = req.body;

  let message = '';
  message += isNameValid(firstName) ? '' : 'Invalid input for First Name. ';
  message += isNameValid(lastName) ? '' : 'Invalid input for Last Name. ';
  message += isEmailValid(email) ? '' : 'Invalid input for Email Address. ';
  message += isPasswordValid(password) ? '' : 'Invalid input for Password. ';
  message += isAgreeToTermsValid(agreeToTerms)
    ? ''
    : 'Invalid input for Agree to Terms. ';
  message += isRoleValid(role)
    ? ''
    : "Invalid input for Role. Available roles at this endpoint are: 'donor', 'recipient', or 'charity'.";
  message += isIntroductionValid(city) ? '' : 'Invalid input for city. ';

  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    user = await prisma.users.create({
      data: {
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        password: hashedPassword,
        agree_to_terms: agreeToTerms,
        role: role,
        status: UserStatus.UNVERIFIED,
        city: city,
        country: country,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'An account with this email address already exists.',
      });
    }
    console.log(error);
    return res.status(500).json({
      message: 'An error occured while saving the user to the database.',
    });
  }

  const payload = { userId: user.id, role: user.role, status: user.status };
  const options = { expiresIn: '4w' };
  const token = jwt.sign(payload, process.env.JWT_SECRET, options);

  const verificationLink = `${process.env.API_BASE_URL}/api/v1/users/custom_user/verify/${token}`;
  sendEmailVerification(email, verificationLink);

  res.status(201).json({ 
    message: 'Successfully saved new user.',
    userId: user.id
   });
  /*
        #swagger.responses[201] = { schema: { message: 'Successfully saved new user.' } }
        #swagger.responses[400] = { schema: { message: '...depends which error occured...' } }
        #swagger.responses[409] = { schema: { message: 'An account with this email address already exists.' } }
        #swagger.responses[500] = { schema: { message: 'An error occured while saving the user to the database.' } }
    */
});

router.post('/login', customUserLogin);

router.put('/update/:id', authnJWT, addUserToReq, authz, async (req, res, next) => {
    /*
          #swagger.summary = 'Update user'
          #swagger.description = 'Updates user details based on provided fields.'
          #swagger.parameters['id'] = { 
              in: 'path',
              description: 'ID of the user to be updated',
              required: true,
              type: 'integer' 
          }
          #swagger.security = [{ "JWT_authentication": [] }]
          #swagger.parameters['Request body'] = {
              in: 'body',
              description: 'Fields to update. Only include the fields you want to change.',
              schema: {
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john.doe@email.com',
                  city: 'London',
                  country: 'UK',
                  story: 'My story...'
              }
          }
          #swagger.responses[200] = { 
              description: 'User successfully updated',
              schema: { 
                  message: 'Successfully updated.' 
              } 
          }
          #swagger.responses[400] = { 
              description: 'Invalid request or nothing to update.',
              schema: { 
                  message: 'Nothing to update.' 
              } 
          }
          #swagger.responses[500] = { 
              description: 'Internal server error',
              schema: { 
                  message: 'Internal server error' 
              } 
          }
      */
  
    const integerId = parseInt(req.params.id, 10);
    const allowedFields = ['firstName', 'lastName', 'email', 'city', 'country', 'story'];
    const updateData = {};
  
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateData[dbField] = req.body[field];
      }
    });
  
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'Nothing to update.',
      });
    }
  
    try {
      user = await prisma.users.update({
        where: { id: integerId },
        data: updateData,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          city: true,
          country: true,
          story: true,
          picture: true,
          updated_at: true,
        }
      });
      res.json({
        message: 'Successfully updated.',
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          city: user.city,
          country: user.country,
          stroy: user.story,
          picture: user.picture,
          updated_at: user.updated_at
        }
      });
    } catch (error) {
      console.log('Error updating user.', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
});

router.put('/:id', authnJWT, addUserToReq, authz, async (req, res, next) => {
  /*
        #swagger.summary = 'Update user password'
        #swagger.parameters['id'] = { description: 'User Id' }
        #swagger.security = [{ "JWT_authentication": [] }]
    */
  const integerId = Math.round(req.params.id);
  const { oldPassword, newPassword } = req.body;
  let message = '';

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
        message: 'Both oldPassword and newPassword are required.'
    });
  }
  // Validation old password
  const user = await prisma.users.findUnique({ where: { id: integerId } });
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    return res.status(400).json({ error: 'Invalid old password.' });
  }

  // Validation new password
  message += isPasswordValid(newPassword) ? '' : 'Invalid input for Password. ';
  if (message) {
    return res.status(400).json({ message });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  try {
    await prisma.users.update({
      where: { id: integerId },
      data: { password: hashedNewPassword },
    });
    res.json({
      message: 'Successfully updated the password.',
    });
  } catch (error) {
    console.log('Error updating password.', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
  /*
        #swagger.responses[200] = { schema: { message: 'Successfully updated the password.' } }
        #swagger.responses[400] = { schema: { message: '...depends which error occurred...' } }
        #swagger.responses[500] = { schema: { message: 'Internal server error' } }
    */
});

router.get('/verify/:token', async (req, res, next) => {
  /*
        #swagger.summary = 'Updates user status to "active", then redirects to success html page'
        #swagger.description = "This endpoint is not normally used by developers. This endpoint handles email verification when the user clicks on a link in their email. On success, the user is shown a web page with a success message. If the token has expired (15 min. time limit), the user is shown a web page with a message to return to the app to Resend email."
        #swagger.parameters['token'] = {
            in: 'path',
            description: 'JWT token used to verify new users',
            type: 'string'
        }
    */
  const token = req.params.token;
  if (!token) {
    return res.status(400).json({
      message:
        'Verification failed. Token is required to be in the query string parameters.',
    });
  }

  let decodedPayload = null;
  try {
    decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.redirect('/email_verify_expired.html');
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      return res
        .status(400)
        .json({ message: 'Email verification failed. Invalid token.' });
    }
    console.log(error);
    return res
      .status(500)
      .json({ message: 'An error occured while trying to verify token.' });
  }

  try {
    await prisma.users.update({
      where: { id: decodedPayload.userId },
      data: { status: UserStatus.ACTIVE },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message:
        'An error occured while updating the user status in the database.',
    });
  }

  res.redirect('/email_verify_success.html');
  /*
        #swagger.responses[302] = { description: 'If token is verified, redirects to success web page. If token has expired, redirects to expired web page.' }
        #swagger.responses[400] = { schema: { message: '...depends which error occured...' } }
        #swagger.responses[500] = { schema: { message: '...depends which error occured...' } }
    */
});

router.post('/verify/resend', async (req, res, next) => {
  /*
        #swagger.summary = 'Sends another verification email'
        #swagger.description = "This endpoint is used to send another verification email, in case the original email did not make it."
        #swagger.parameters['Request body'] = {
            in: 'body',
            schema: { $email: 'john@email.com' }
        }
    */
  const email = req.body.email;
  if (!isEmailValid(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  try {
    user = await prisma.users.findUniqueOrThrow({
      where: {
        email: email,
      },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(400).json({
        message:
          'A user with that email address was not found in the database.',
      });
    }
    console.log(error);
    return res.status(500).json({
      message:
        'An error occured when trying to get the user from the database.',
    });
  }

  const payload = { userId: user.id, role: user.role, status: user.status };
  const options = { expiresIn: '15m' };
  const token = jwt.sign(payload, process.env.JWT_SECRET, options);

  const verificationLink = `${process.env.API_BASE_URL}/api/v1/users/custom_user/verify/${token}`;
  sendEmailVerification(email, verificationLink);

  res.json({ message: 'Successfully sent another verification email.' });
  /*
        #swagger.responses[200] = { schema: { message: 'Successfully sent another verification email.' } }
        #swagger.responses[400] = { schema: { message: '...depends which error occured...' } }
        #swagger.responses[500] = { schema: { message: 'An error occured when trying to get the user from the database.' } }
    */
});

export default router;