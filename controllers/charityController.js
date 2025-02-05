import { BucketName, s3 } from '../middleware/digitalOceanConfig.js';
import { findCharityByAdminIdDB, createCharityDB, getAllCharitiesDB, getCharityIdDB, updateCharityDB, deleteCharityDB, uploadCharityPictureDB, getCharityByLocationDB } from '../models/charityModel.js';
import { getDonationByCharityIdDB } from '../models/donationModel.js';
import { isNameValid, isIntroductionValid, isSocialLInkValid, isIdValid } from '../utils/validation.js';

const validateCharityData = (data) => {
  let message = '';
  message += isNameValid(data.name) ? '' : 'Invalid input for Name. ';
  message += isIntroductionValid(data.description) ? '' : 'Invalid input for Description. ';
  message += isIntroductionValid(data.contact) ? '' : 'Invalid input for Contact. ';
  message += isNameValid(data.address) ? '' : 'Invalid input for Address. ';
  message += isNameValid(data.postal_code) ? '' : 'Invalid input for Postal Code. ';
  message += isSocialLInkValid(data.social_link) ? '' : 'Invalid input for Social Link. ';
  message += isIdValid(data.user_id_admin) ? '' : 'Invalid input for User Id Admin. ';
  return message;
};

const createNewCharity = async (req, res) => {
    /*
        #swagger.summary = 'Creates new charity'
        #swagger.description = "Create charity. All parameters need to be filled, user_id_admin needs to be the ID of the user who is creating the charity."
        #swagger.parameters['Request body'] = {
            in: 'body',
            schema: {
                $name: 'Unify Giving',
                $description: 'Donation to homeless ....',
                $address: '20 London Road',
                $city: 'London',
                $country: 'London',
                $postal_code: 'W1J 0DW',
                $contact: '+441234567899',
                $social_link: 'https://www.instagram.com',
                $user_id_admin: 123
            }
        }
        #swagger.responses[201] = { schema: { message: 'Successfully saved new charity.' } }
        #swagger.responses[400] = { schema: { message: '...depends which error occured...' } }
        #swagger.responses[500] = { schema: { message: 'An error occured while saving the user to the database.' } }
    */
  const {
    name,
    description,
    address,
    city,
    country,
    postal_code,
    contact,
    social_link,
    user_id_admin,
  } = req.body;

  const validationMessage = validateCharityData(req.body);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage.trim() });
  }

  try {
    const existingCharity = await findCharityByAdminIdDB(user_id_admin);
    if (existingCharity) {
      return res.status(400).json({ message: 'This user is already associated with another charity.' });
    }

    const charity = await createCharityDB({
      name,
      description,
      address,
      city,
      country,
      postal_code,
      contact,
      social_link,
      user_id_admin,
    });

    res.status(201).json({ message: 'Successfully saved new charity.', charity });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

const getAllCharities = async (req, res) => {
  /*
    #swagger.summary = 'Get all charity'
    #swagger.description = To get all charities from DB
    #swagger.security = [{ "JWT_authentication": [] }]
    #swagger.responses[200] = {
      description: 'User successfully obtained.',
      schema: {
        "charity": [
          {
            "id": 1,
            "name": "Unify Giving",
            "description": "Created to donation...",
            "address": "20 London Road",
            "city": "London",
            "contry": "Uk",
            "postal_code": "LN10 20BB",
            "contact": "+44123456789",
            "social_link": null,
            "picture": null,
            "user_id_admin": null,
            "created_at": "2023-07-14T19:56:05.216Z",
            "updated_at": "2023-07-14T19:56:05.216Z"
          },
          {
            "id": 4,
            "name": "Barnabus",
            "description": "A charity which started off with one man walking the streets and giving food to those in need now supports 600 people every week, has been bringing hope to the homeless for the last 25 years. The team at Barnabus have received the unsung heroes Queens Award for Voluntary Service and rely entirely on donations.",
            "address": "61 Bloom Street",
            "city": "Manchester",
            "contry": "Uk",
            "postal_code": "M1 3LY",
            "contact": "+44 0161 237 3223",
            "social_link": "test",
            "picture": null,
            "user_id_admin": 8,
            "created_at": "2023-07-15T14:37:00.326Z",
            "updated_at": "2023-07-15T14:37:00.326Z",
          }
        ]
      }
    }
    #swagger.responses[400] = { schema: { message: 'Authorization header is undefined. Did you forget to add the authorization header to your request?' } }
    #swagger.responses[401] = { schema: { message: 'Your session has expired. Please log in again.' }}
    #swagger.responses[500] = { description: 'An error occured while searching the user profile on the database.' }
  */
  try {
        const charities = await getAllCharitiesDB();
        res.status(200).json({ charities });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

const getCharityId = async (req, res) => {
  /*
    #swagger.summary = 'Get charity by id'
    #swagger.description = To get charity with the specified id from DB
    #swagger.security = [{ "JWT_authentication": [] }]
    #swagger.responses[200] = {
      description: 'Charity successfully obtained.',
      schema: {
        "charity": {
          "id": 4,
          "name": "Barnabus",
          "description": "A charity which started off with one man walking the streets and giving food to those in need now supports 600 people every week, has been bringing hope to the homeless for the last 25 years. The team at Barnabus have received the unsung heroes Queens Award for Voluntary Service and rely entirely on donations.",
          "address": "61 Bloom Street",
          "city": "Manchester",
          "contry": "Uk",
          "postal_code": "M1 3LY",
          "contact": "+44 0161 237 3223",
          "social_link": "test",
          "picture": null,
          "user_id_admin": 8,
          "created_at": "2023-07-15T14:37:00.326Z",
          "updated_at": "2023-07-15T14:37:00.326Z",
          "user_recipient": [
            {
              "id": 25,
              "email": "recipient9@email.com",
              "first_name": "Jack",
              "last_name": "Doe",
              "password": "$2a$10$XtlPqJNkIZxrUUpaZv6Hf.Xs.NrRH.TTiF9Bj1Z4e.4kmfiGeez9K",
              "agree_to_terms": true,
              "role": "recipient",
              "status": "unverified",
              "story": null,
              "bio": "",
              "picture": null,
              "social_link": null,
              "charity_id_admin": null,
              "charity_id_recipient": 4,
              "created_at": "2023-07-18T21:49:55.143Z",
              "updated_at": "2023-07-18T21:49:55.143Z"
            }
          ]
        }
      }
    }
    #swagger.responses[400] = { schema: { message: 'Authorization header is undefined. Did you forget to add the authorization header to your request?' } }
    #swagger.responses[401] = { schema: { message: 'Your session has expired. Please log in again.' }}
    #swagger.responses[500] = { description: 'An error occured while searching the charity profile on the database.' }
    */

  try {
      const charity = await getCharityIdDB(req.charity.id);
      if (!charity) {
          return res.status(404).json({ message: 'Charity not found' });
      }
      res.status(200).json(charity);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message:'An error occurred while searching the charity profile in the database.' });
  }
};

const updateCharity = async (req, res) => {
  /*
    #swagger.summary = 'Updates a Charity by Id'
    #swagger.parameters['id'] = { description: 'Charity ID' }
    #swagger.description = "Updates a charity. Only provided parameters will be updated."
    #swagger.security = [{ "JWT_authentication": [] }]
    #swagger.parameters['Request body'] = {
      in: 'body',
      schema: {
        name: 'Unify Giving',
        description: 'Donation to homeless ....',
        address: '20 London Road',
        city: 'London',
        country: 'UK',
        postal_code: 'W1J 0DW',
        contact: '+441234567899',
        social_link: 'https://www.instagram.com'
      }
    }
  */
  const allowedFields = [
    'name',
    'description',
    'address',
    'city',
    'country',
    'postal_code',
    'contact',
    'social_link'
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      message: 'Nothing to update.',
    });
  }

  try {
    const charity = await updateCharityDB(req.charity.id, updateData);    
    res.status(200).json({ message: 'Charity updated successfully', charity });
  } catch (error) {
    console.log('Error updating charity:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const deleteCharity = async (req, res) => {
  /*
    #swagger.summary = 'Delete a charity by id'
    #swagger.description = "This performs a delete."
    #swagger.security = [{ "JWT_authentication": [] }] 
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'The id of the charity to be deleted.',
        type: 'string'
    }
    #swagger.responses[200] = { schema: { message: 'Successfully deleted charity.' } }
    #swagger.responses[400] = { schema: { message: '...depends which error occured...' } }
    #swagger.responses[401] = { schema: { message: '...depends which error occured...' } }
    #swagger.responses[403] = { schema: { message: 'Access denied. You can only access your own records. This error can also happen if an address id for the requested resource was not found.' } }
    #swagger.responses[500] = { schema: { message: '...depends which error occured...' } }
  */
  try {
    const donations = await getDonationByCharityIdDB(req.charity.id);
    if (donations.length > 0) {
      throw new Error('Cannot delete charity with active donations.');
    }
    await deleteCharityDB(req.charity.id);
    res.json({ message: 'Successfully deleted charity.' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(400).json({ message: 'A charity with that id was not found in the database.' });
    }
    console.log(error);
    return res.status(500).json({ message: 'An error occurred while deleting the charity in the database.' });
  }        
};

const uploadCharityPicture = async (req, res) => {
  /*
    #swagger.summary = 'Upload charity picture'
    #swagger.security = [{ "JWT_authentication": [] }]
    #swagger.parameters['id'] = { 
      description: 'Charity Id.',
        in: 'path',
        required: true,
        type: 'string'
      }
    #swagger.parameters['image'] = {
        description: 'Image to upload.',
        in: 'formData',
        required: true,
        type: 'file'
    }
    #swagger.responses[200] = { schema: { message: 'Successfully uploaded charity picture.' } }
    #swagger.responses[400] = { schema: { message: '...depends which error occured...' } }
    #swagger.responses[500] = { schema: { message: 'Internal server error' } }
    */
  const charityId = parseInt(req.params.id);
  const fileName = req.fileName;

  try{
    const charity = await uploadCharityPictureDB(charityId, fileName)
    res.status(200).json({ message: 'Charity picture uploaded successfully', charity });
  }catch(error){
    console.log('Error updating charity:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const updateCharityPicture = async (req, res) => {
  /*
    #swagger.summary = 'Update charity picture'
    #swagger.security = [{ "JWT_authentication": [] }]
    #swagger.parameters['id'] = { 
      description: 'Charity Id.',
        in: 'path',
        required: true,
        type: 'string'
    }
    #swagger.parameters['image'] = {
        description: 'Image to update.',
        in: 'formData',
        required: true,
        type: 'file'
    }
    #swagger.responses[200] = { schema: { message: 'Successfully updated charity picture.' } }
    #swagger.responses[400] = { schema: { message: '...depends which error occured...' } }
    #swagger.responses[500] = { schema: { message: 'Internal server error' } }
    */
  try {
    const charityId = parseInt(req.params.id);
    const fileName = req.fileName;

    // Retrieve old picture's file name from database
    const charity = await getCharityIdDB(charityId);
      if (!charity) {
          return res.status(404).json({ message: 'Charity not found' });
      }

    // Define params needed to remove old picture from Spaces
    const oldPicture = charity.picture;
    let deleteParams = {
      Bucket: BucketName,
      Key: oldPicture,
    };

    // Delete old picture from Spaces
    s3.deleteObject(deleteParams, (error, data) => {
      if (error) {
        return res.status(500).json({
          message: 'Unable to delete old image from DigitalOcean Spaces.',
        });
      }
    });

    // Replace 'picture' field in database with new file name
    const updatePicture = await uploadCharityPictureDB(charityId, fileName)
    res.json({ message: 'Successfully updated charity picture.', updatePicture });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCharityByLocation = async (req, res) => {
  /*
    #swagger.summary = 'Get all charities by location'
    #swagger.description = To get all recipient users from DB by location
    #swagger.security = [{ "JWT_authentication": [] }]
    #swagger.parameters['Request body'] = {
        in: 'body',
        schema: {
            $location: 'London, UK',
        }
    }
    #swagger.responses[200] = {
      description: 'Charities successfully obtained.'
    }
    #swagger.responses[400] = { schema: { message: 'Location is required.' } }
    #swagger.responses[500] = { description: 'An error occurred while searching recipients on the database.' }
  */
  try {
    const charity = await getCharityByLocationDB(req.body.city, req.body.country);

    if (charity.length > 0) {
      res.json({ charity });
    } else {
      res.status(404).json({ message: 'No charities found in this location.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:'An error occurred while searching the charity profile in the database.' });   
  }
};

export { createNewCharity, getAllCharities, getCharityId, updateCharity, deleteCharity, uploadCharityPicture, updateCharityPicture, getCharityByLocation };