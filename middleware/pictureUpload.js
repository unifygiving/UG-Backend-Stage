import { getUserPicturebyIdDB, updateUserDB } from "../models/usersModel.js";
import { BucketName, s3 } from "./digitalOceanConfig.js";

const handlePictureUpload = async (req, res, next) => {
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
        const user = getUserPicturebyIdDB(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        
        const oldPicture = user.picture;  
        if (oldPicture) {
            const deleteParams = {
                Bucket: BucketName,
                Key: oldPicture,
            };

            s3.deleteObject(deleteParams, (error) => {
                if (error) {
                    console.error('Error deleting old image from Spaces:', error);
                    return res.status(500).json({ message: 'Unable to delete old image from DigitalOcean Spaces.' });
                }
            });
        }
        await updateUserDB(req.user.id, {picture: req.fileName})

        res.json({ message: 'Successfully uploaded picture.', picture: req.fileName });
  
    } catch (error) {
        console.error('Error updating picture:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const handlePictureUpdate = async (userId, newPictureUrl) => {
    const user = await getUserPicturebyIdDB(userId);
    if (!user) {
      throw new Error('User not found.');
    }
  
    const oldPicture = user.picture;
    if (oldPicture) {
      const deleteParams = {
        Bucket: BucketName,
        Key: oldPicture,
      };
  
      await s3.deleteObject(deleteParams).promise();
    }
  
    await updateUserDB(userId, { picture: newPictureUrl });
    return newPictureUrl;
  };
  
  
export { handlePictureUpload, handlePictureUpdate };