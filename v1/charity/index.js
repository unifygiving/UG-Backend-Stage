import express from 'express';
import authnJWT from '../../../../middleware/authn.js';
import addCharityToReq from '../../../../middleware/addCharityToReq.js';
import authz from '../../../../middleware/authz.js';
import multer from 'multer';
import { uploadImage } from '../../../../middleware/digitalOceanConfig.js';
import { createNewCharity, deleteCharity, getAllCharities, getCharityByLocation, getCharityId, updateCharity, updateCharityPicture, uploadCharityPicture } from '../../../../controllers/charityController.js';
import { handlePictureUpload } from '../../../../middleware/pictureUpload.js';
import addUserToReq from '../../../../middleware/addUserToReq.js';

const router = express.Router();
router.use(express.json());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', authnJWT, createNewCharity);

router.get('/', authnJWT, getAllCharities);

router.get('/:id', authnJWT, addCharityToReq, getCharityId);

router.put('/:id', authnJWT, addCharityToReq, authz, updateCharity);

router.delete('/:id', authnJWT, addCharityToReq, authz, deleteCharity);

router.post('/picture/:id', authnJWT, addCharityToReq, authz, upload.single('image'), uploadImage, uploadCharityPicture);

router.put( '/picture/:id', authnJWT, addCharityToReq, authz, upload.single('image'), uploadImage, updateCharityPicture);

router.post('/location', authnJWT, getCharityByLocation);

router.put('/recipient/picture/:id', authnJWT, addUserToReq, authz, upload.single('image'), uploadImage, handlePictureUpload);

export default router;