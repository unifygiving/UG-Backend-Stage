import { prisma } from "../db_share.js";
import { uploadImageToSpaces } from "../middleware/digitalOceanConfig.js";
import { handlePictureUpdate } from "../middleware/pictureUpload.js";
import { getCharityIdDB } from "../models/charityModel.js";
import { getDonationByRecipientIdDB } from "../models/donationModel.js";
import { getTransactionByRecipientIdDB } from "../models/transactionModel.js";
import { customUserLoginDB, getUserByQrCodeDB, getUserRecipientByIdDB, newRecipientDB } from "../models/usersModel.js";
import { UserRole, UserStatus } from "../utils/enums.js";
import bcrypt from 'bcryptjs';
import { Prisma } from "@prisma/client";
import { isEmailValid, isPasswordValid } from "../utils/validation.js";
import { formatRoleData } from "../middleware/userRoleData.js";
import { createJWT } from "../utils/createJWT.js";

const getUserByQrCode = async (req, res) => {
      /*
    #swagger.summary = 'Get user by Qr Code'
    #swagger.description = To get user(recipient) with the specified qr code from DB
    #swagger.security = [{ "JWT_authentication": [] }]
    #swagger.responses[200] = {
      description: 'User successfully obtained.',
      schema: {
            "user": {
                "id": 25,
                "first_name": "Jack",
                "last_name": "Doe",
                "picture": "image.png",
                "city": "London",
                "country": "Uk",
                "balance": 450
            }
        }
      }
    }
    #swagger.responses[400] = { schema: { message: 'Authorization header is undefined. Did you forget to add the authorization header to your request?' } }
    #swagger.responses[401] = { schema: { message: 'Your session has expired. Please log in again.' }}
    #swagger.responses[500] = { description: 'An error occured while searching the charity profile on the database.' }
    */
    if(!req.body.qrcode){
        return res.status(400).json({ message: "QrCode is required." });
    }
    try{
        const user = await getUserByQrCodeDB(req.body.qrcode);
        res.status(200).json(user);
    }catch(error){
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'User not found.' });
        }
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

const getUserRecipientById = async(req, res) =>{
        /*
        #swagger.summary = 'Get recipient by id'
        #swagger.description = To get a recipient user by ID from DB
        #swagger.security = [{ "JWT_authentication": [] }]
        #swagger.responses[200] = { description: 'User successfully obtained.', schema: { "recipient":
            {
            "id": 9,
            "email": "fakerecipient@email.com",
            "first_name": "Fake",
            "last_name": "Recipient",
            "status": "active",
            "story": null,
            "city": 'London',
            "country": 'Uk',
            "picture": null,
            "qr_code": null,
            "charity_id": 3,
        }}}
        #swagger.responses[400] = { schema: { message: 'Authorization header is undefined. Did you forget to add the authorization header to your request?' } }
        #swagger.responses[401] = { schema: { message: 'Your session has expired. Please log in again.' }}
        #swagger.responses[403] = { schema: { message: 'Access denied. User is not a recipient.' }}
        #swagger.responses[500] = { description: 'An error occurred while searching the user profile on the database.' }
    */
   
    try {
        if (req.user.role !== UserRole.RECIPIENT) {
            return res.status(403).json({ message: 'Access denied. User is not a recipient.' });
        }

        const recipient = await getUserRecipientByIdDB(req.user.id)

        if (recipient) {
            res.json({ recipient });
        } else {
            res.status(404).json({ message: 'Recipient not found.' });
        }

    } catch (error) {
        res.status(500).json({ message: 'An error occurred while searching recipients on the database.' });
    }
};

const getCombinedDataByRecipientId = async (req, res) => {
    /*
        #swagger.summary = 'Get combined donations and transactions by recipient ID'
        #swagger.description = To fetch both donations (as income) and transactions (as expense) by recipient ID, sorted by creation date.
        #swagger.security = [{ "JWT_authentication": [] }]
        #swagger.responses[200] = { 
            description: 'Combined list of donations and transactions successfully obtained.',
            schema: [
                {
                    "id": 18,
                    "amount": "22.1",
                    "created_at": "2024-10-29T20:07:23.234Z",
                    "user_id": 5,
                    "business_id": 9,
                    "products": "Tea, Bread",
                    "receipt": null,
                    "type": "expense"
                },
                {
                    "id": 27,
                    "donor_id": 1,
                    "charity_id": 1,
                    "recipient_id": 5,
                    "amount_donation": "5.23",
                    "message": "11/10/2024",
                    "created_at": "2024-10-27T13:07:42.747Z",
                    "updated_at": "2024-10-27T13:07:42.747Z",
                    "payment_id": 109,
                    "type": "income"
                }
            ]
        }
        #swagger.responses[400] = { 
            description: 'Invalid request format or missing recipient ID.',
            schema: { message: 'Authorization header is undefined. Did you forget to add the authorization header to your request?' }
        }
        #swagger.responses[401] = { 
            description: 'Unauthorized access due to expired session.',
            schema: { message: 'Your session has expired. Please log in again.' }
        }
        #swagger.responses[403] = { 
            description: 'Access denied due to insufficient permissions.',
            schema: { message: 'Access denied. User is not a recipient.' }
        }
        #swagger.responses[500] = { 
            description: 'Server error while retrieving data from the database.',
            schema: { message: 'An error occurred while fetching combined data.' }
        }
    */

    try {
        const donations = (await getDonationByRecipientIdDB(req.user.id)).map(donation => ({
            ...donation,
            type: 'income'
        }));

        const transactions = (await getTransactionByRecipientIdDB(req.user.id)).map(transaction => ({
            ...transaction,
            type: 'expense'
        }));

        const combinedData = [...donations, ...transactions];
        combinedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.status(200).json(combinedData);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching combined data.' });
    }
};

const newRecipient = async (req, res) => {
    /*
        #swagger.summary = 'Create new recipient'
        #swagger.description = 'Endpoint to create new recipient by charity'
        #swagger.parameters['firstName'] = {
            in: 'formData',
            description: 'First name of the recipient',
            required: true,
            type: 'string',
            example: 'John'
        }
        #swagger.parameters['lastName'] = {
            in: 'formData',
            description: 'Last name of the recipient',
            required: true,
            type: 'string',
            example: 'Doe'
        }
        #swagger.parameters['email'] = {
            in: 'formData',
            description: 'Email address of the recipient',
            required: true,
            type: 'string',
            example: 'john@email.com'
        }
        #swagger.parameters['password'] = {
            in: 'formData',
            description: 'Password for the recipient account',
            required: true,
            type: 'string',
            example: 'bad12345'
        }
        #swagger.parameters['story'] = {
            in: 'formData',
            description: 'Story about the recipient',
            required: false,
            type: 'string',
            example: 'String'
        }
        #swagger.parameters['city'] = {
            in: 'formData',
            description: 'City where the recipient resides',
            required: true,
            type: 'string',
            example: 'London'
        }
        #swagger.parameters['country'] = {
            in: 'formData',
            description: 'Country where the recipient resides',
            required: true,
            type: 'string',
            example: 'UK'
        }
        #swagger.parameters['charity_id_recipient'] = {
            in: 'formData',
            description: 'Charity ID associated with the recipient',
            required: true,
            type: 'integer',
            example: 25
        }
        #swagger.parameters['image'] = {
            description: 'Image to upload or update.',
            in: 'formData',
            required: true,
            type: 'file'
        }
        #swagger.responses[201] = { schema: { message: 'Successfully saved new recipient.' } }
        #swagger.responses[400] = { schema: { message: '...depends which error occurred...' } }
        #swagger.responses[409] = { schema: { message: 'An account with this email address already exists.' } }
        #swagger.responses[500] = { schema: { message: 'An error occurred while saving the user to the database.' } }
    */
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.charity_id_recipient = parseInt(req.body.charity_id_recipient, 10);
        req.body.password = hashedPassword;
        req.body.agreeToTerms = true;

        const charity = await getCharityIdDB(req.body.charity_id_recipient);
        if (!charity) {
            return res.status(404).json({ message: 'Charity not found.' });
        }

        const recipient = await newRecipientDB(req.body);

        if (req.file) {
            const newPictureUrl = await uploadImageToSpaces(req.file);
            await handlePictureUpdate(recipient.id, newPictureUrl);
            recipient.picture = newPictureUrl;
        }

        res.status(201).json({ message: 'Successfully saved new recipient.', recipient });

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
};

const updateRecipient = async(req, res) => {
    /*
        #swagger.summary = 'Update recipient user'
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
        let user;
    
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
                message: 'Recipient successfully updated.',
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
}

const customUserLogin = async(req,res) => {
    /*
        #swagger.summary = 'Login a user'
        #swagger.description = 'User login endpoint. Validates the provided email and password. Returns a JWT token upon successful login. The response varies depending on the user\'s role, providing role-specific information such as user details and associated business IDs (for business users). Errors are returned for invalid credentials, inactive accounts, or conflicts with Google login.'
        #swagger.parameters['Request body'] = {
            in: 'body',
            schema: {
                $email: 'john@email.com',
                $password: 'bad12345',
            }
        }
        #swagger.responses[200] = {
            schema: {
                id: 274,
                email: 'john@email.com',
                firtName: 'John',
                lastName: 'Doe',
                role: 'donor',
                status: 'active',
                city: 'London',
                country: 'London',
                balance: '120.00',
                picture: '/16352_1657360145439.jpg',
                createdAt: '2023-05-22T03:27:50.527Z',
                updatedAt: '2023-05-22T03:27:50.527Z',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjksInJvbGUiOiJkb25vciIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTY4NDc4MzY5NiwiZXhwIjoxNjg0ODY2NDk2fQ.cQDtLE9Cm6bZvq8SlhoSt4WeTCIja-bgvfkV1t_wy8k'
            }
        }
        #swagger.responses[400] = { schema: { message: 'Invalid input for email address. Invalid input for password.' } }
        #swagger.responses[401] = { schema: { message: 'Password incorrect. Email incorrect.' } }
        #swagger.responses[403] = { schema: { message: 'Cannot log in to that account. The account status is: inactive.' } }
        #swagger.responses[409] = { schema: { message: 'This email is associated with a Google login. Use Google login to access your account.' } }
        #swagger.responses[500] = { schema: { message: 'A database error occurred. Please try again later.' } }
    */

    let message = '';
    message += isEmailValid(req.body.email) ? '' : 'Invalid input for email address. ';
    message += isPasswordValid(req.body.password) ? '' : 'Invalid input for password. ';
    if (message) {
      return res.status(400).json({ message });
    }

    try {
        let user = await customUserLoginDB(req.body.email);
    
        if (!user) {
          return res.status(401).json({ message: 'Email incorrect.' });
        }
    
        if (user.google_id) {
            return res.status(409).json({ message: 'This email is associated with a Google login. Use Google login to access your account.' });
        }          
    
        const isMatch = bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Password incorrect.' });
        }
    
        if (user.status !== UserStatus.ACTIVE) {
          return res.status(403).json({
            message: `Cannot log in to that account. The account status is: ${user.status}.`,
          });
        }
        const token = createJWT(user);
        let roleData = formatRoleData(user);
    
        res.json({ ...roleData, token });
      }catch (error) {
        console.log(error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(401).json({ message: 'Email and/or password incorrect.' });
            } else {
                return res.status(500).json({
                    message: 'A database error occurred. Please try again later.',
                });
            }
      }
        return res.status(500).json({
            message: 'An unexpected error occurred. Please try again later.',
        });
    }
}

export { getUserByQrCode, getUserRecipientById, getCombinedDataByRecipientId, newRecipient, updateRecipient, customUserLogin };