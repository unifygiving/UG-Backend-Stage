import express from 'express';
import { prisma} from '../../../../db_share.js';
import jwt from 'jsonwebtoken';
import { serializeUser } from '../../../../utils/serialize.js';
import { UserStatus } from '../../../../utils/enums.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client();
router.use(express.json());
let user;

router.post('/new', async (req, res, next) => {
    /*
          #swagger.summary = 'Sign in google user'
          #swagger.parameters['Request body'] = {
              in: 'body',
              schema: {
                  $token: 'google_oauth_token'
              }
          }
      */
    const { token } = req.body;
  
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
  
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }
  
    const payload = ticket.getPayload();
    const google_id = payload.sub;
    const firstName = payload.given_name;
    const lastName = payload.family_name;
    const email = payload.email;
    const picture = payload.picture;
    const agreeToTerms = true;
    const role = 'donor';
    const city = null;
    const country = null;
    
    try {

        user = await prisma.users.create({
            data: {
            google_id: google_id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            picture: picture,
            agree_to_terms: agreeToTerms,
            role: role,
            status: UserStatus.ACTIVE,
            city: city,
            country: country
            },
      });
  
      const payload = { userId: user.id, role: user.role, status: user.status };
      const options = { expiresIn: '4w' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, options);
  
      const userData = serializeUser(user);
      res.status(201).json({ ...userData, token });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          message: 'An account with this email address already exists.',
        });
      }
      console.log(error);
      return res.status(500).json({
        message: 'An error occurred while saving the user to the database.',
      });
    }
  
    /*
          #swagger.responses[201] = { schema: { message: 'Successfully saved new user.' } }
          #swagger.responses[400] = { schema: { message: '...depends which error occurred...' } }
          #swagger.responses[409] = { schema: { message: 'An account with this email address already exists.' } }
          #swagger.responses[500] = { schema: { message: 'An error occurred while saving the user to the database.' } }
      */
  });

router.post('/login', async (req, res) => {
/*
        #swagger.summary = 'Login a google user'
        #swagger.parameters['Request body'] = {
            in: 'body',
            schema: {
                $token: 'google_oauth_token',
            }
        }
    */
const { token } = req.body;

if (!token) {
    return res.status(400).json({ message: 'Token is required' });
}

let ticket;
try {
    ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
    });
} catch (error) {
    return res.status(400).json({ message: 'Invalid Google token' });
}

const payload = ticket.getPayload();
const email = payload.email;
const google_id = payload.sub;

try {
    user = await prisma.users.findUniqueOrThrow({
    where: {
        email: email,
        google_id: google_id,
    },
    include: {
        donations_given: { where: { payment: { status: 'paid' }}},
        donations_received: { where: { payment: { status: 'paid' }}}
    },
    });
} catch (error) {
    if (error.code === 'P2025') {
    return res.status(404).json({ message: 'User not found.' });
    }
    console.log(error);
    return res.status(500).json({
    message: 'An error occurred when trying to get the user from the database.',
    });
}

const payloadJwt = { userId: user.id, role: user.role, status: user.status };
const options = { expiresIn: '4w' };
const tokenJwt = jwt.sign(payloadJwt, process.env.JWT_SECRET, options);

const userData = serializeUser(user);
res.json({ ...userData, tokenJwt});
/*
        #swagger.responses[200] = {
            schema: {
                id: 274,
                google_id: 123,
                email: 'john@email.com',
                firtName: 'John',
                lastName: 'Doe',
                role: 'donor',
                status: 'active',
                city: 'London',
                country: 'Uk',
                picture: '/16352_1657360145439.jpg',
                charityId: 3764,
                createdAt: '2023-05-22T03:27:50.527Z',
                updatedAt: '2023-05-22T03:27:50.527Z',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksInJvbGUiOiJkb25vciIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTY4NDc4MzY5NiwiZXhwIjoxNjg0ODY2NDk2fQ.cQDtLE9Cm6bZvq8SlhoSt4WeTCIja-bgvfkV1t_wy8k'
            }
        }
        #swagger.responses[400] = { schema: { message: '...depends which error occured...' } }
        #swagger.responses[500] = { schema: { message: 'An error occured when trying to get the user from the database.' } }
    */
});

export default router;