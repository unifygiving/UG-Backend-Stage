import express from 'express';
import authnJWT from '../../../../middleware/authn.js';
import authz from '../../../../middleware/authz.js';
import { createBusiness } from '../../../../controllers/businessController.js';
import { getUserByQrCode } from '../../../../controllers/usersController.js';
import { newTransaction } from '../../../../controllers/transactionController.js';
import addBusinessToReq from "../../../../middleware/addBusinessToReq.js"

const router = express.Router();
router.use(express.json());

router.post('/', authnJWT, authz, createBusiness);

router.post('/find_recipient', authnJWT, authz, getUserByQrCode);

router.post('/transaction/:id', addBusinessToReq, authnJWT, authz, newTransaction);

export default router;