import express from 'express';
import googleUser from './googleUser.js';
import recipient from './recipient.js';
import customUser from './customUser.js';
import userActions from './userActions.js';

const router = express.Router();
router.use(express.json());

router.use('/google_user', googleUser);
router.use('/recipient', recipient);
router.use('/custom_user', customUser);
router.use('/user_actions', userActions);

export default router;