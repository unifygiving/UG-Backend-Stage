import express from 'express';
import { prisma } from '../../../../db_share.js';
import authnJWT from '../../../../middleware/authn.js';
import addReqToUser from '../../../../middleware/addUserToReq.js';
import { getCombinedDataByRecipientId, getUserRecipientById, newRecipient, updateRecipient } from '../../../../controllers/usersController.js';
import authz from '../../../../middleware/authz.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();
router.use(express.json());
let recipient;

router.get('/list', authnJWT, async (req, res, next) => {
/*
        #swagger.summary = 'Get all recipient'
        #swagger.description = To get all recipient users from DB
        #swagger.security = [{ "JWT_authentication": [] }]
    */
    try {
        recipient = await prisma.users.findMany({ 
            where: { role: 'recipient' },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                story: true,
                picture: true,
                country: true,
                city: true,
                charity_id_recipient: true,
            }
        });
        if (recipient) { res.json({ recipient });}
    } catch (error) {
        res.status(500).json({ message: 'An error occured while searching recipients on the database.' });
    }

/*
    #swagger.responses[200] = {
    description: 'User successfully obtained.',
        schema: {
        "recipient": [
            {
            "id": 9,
            "email": "fakerecipient@email.com",
            "first_name": "Fake",
            "last_name": "Recipient",
            "password": "$2a$10$OWojPnrPLxX0TfV5NCaqEu65gSOKaWCAcupoYmekuxKq1eHC68Ulq",
            "agree_to_terms": true,
            "role": "recipient",
            "status": "active",
            "story": null,
            "city": 'London',
            "country": 'Uk',
            "picture": null,
            "qr_code": null,
            "charity_id": 3,
            "created_at": "2023-07-14T19:51:47.998Z",
            "updated_at": "2023-07-14T19:51:47.998Z"
            },
            {
            "id": 10,
            "email": "john@email.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "$2a$10$qbXFZuIVskMyLZYoSHqQaulbP3g8sXECKUiY81Zdd7uGSESbfMbYe",
            "agree_to_terms": true,
            "role": "recipient",
            "status": "active",
            "story": null,
            "city": 'London',
            "country": 'Uk',
            "picture": null,
            "qr_code": null,
            "charity_id": 465,
            "created_at": "2023-07-16T16:02:36.731Z",
            "updated_at": "2023-07-16T16:02:36.731Z"
            },
            {
            "id": 12,
            "email": "jack@email.com",
            "first_name": "Jack",
            "last_name": "Doe",
            "password": "$2a$10$ufhQVsD93AFD7cgxj/thi.txqk9HAwNG8AK7dzBalVzySksvXDIki",
            "agree_to_terms": true,
            "role": "recipient",
            "status": "active",
            "story": null,
            "city": 'London',
            "country": 'Uk',
            "picture": null,
            "qr_code": null,
            "charity_id": 465,
            "created_at": "2023-07-16T16:03:23.641Z",
            "updated_at": "2023-07-16T16:03:23.641Z"
            },
            {
            "id": 13,
            "email": "joe@email.com",
            "first_name": "Joe",
            "last_name": "Doe",
            "password": "$2a$10$gQSkm2dNaXvxrAcNbuUBlueQYBnqHqLPbPQaYEcZz9nKQAtFCwobe",
            "agree_to_terms": true,
            "role": "recipient",
            "status": "active",
            "story": null,
            "city": 'London',
            "country": 'Uk',
            "picture": null,
            "qr_code": null,
            "charity_id": 465,
            "created_at": "2023-07-16T16:04:04.033Z",
            "updated_at": "2023-07-16T16:04:04.033Z"
            }
        ]
        }
    }
    #swagger.responses[400] = { schema: { message: 'Authorization header is undefined. Did you forget to add the authorization header to your request?' } }
    #swagger.responses[401] = { schema: { message: 'Your session has expired. Please log in again.' }}
    #swagger.responses[500] = { description: 'An error occured while searching the user profile on the database.' }
*/
});
  
router.post('/location', authnJWT, async (req, res, next) => {
    /*
        #swagger.summary = 'Get all recipients by location'
        #swagger.description = To get all recipient users from DB by location
        #swagger.security = [{ "JWT_authentication": [] }]
        #swagger.parameters['Request body'] = {
            in: 'body',
            schema: {
                $city: 'London',
                $country: 'UK'
            }
        }
        #swagger.responses[200] = {
            description: 'Recipients successfully obtained.',
            schema: {
                "recipients": [
                    {
                        "id": 9,
                        "email": "fakerecipient@email.com",
                        "first_name": "Fake",
                        "last_name": "Recipient",
                        "role": "recipient",
                        "status": "active",
                        "city": "London",
                        "country": "UK",
                        "charity_id": 3,
                    },
                    {
                        "id": 10,
                        "email": "john@email.com",
                        "first_name": "John",
                        "last_name": "Doe",
                        "role": "recipient",
                        "status": "active",
                        "city": "London",
                        "country": "UK",
                        "charity_id": 465,
                    },
                    {
                        "id": 12,
                        "email": "jack@email.com",
                        "first_name": "Jack",
                        "last_name": "Doe",
                        "role": "recipient",
                        "status": "active",
                        "city": "London",
                        "country": "UK",
                        "charity_id": 465,
                        "created_at": "2023-07-16T16:03:23.641Z",
                        "updated_at": "2023-07-16T16:03:23.641Z"
                    }
                ]
            }
        }
        #swagger.responses[400] = { schema: { message: 'Location is required.' } }
        #swagger.responses[500] = { description: 'An error occurred while searching recipients on the database.' }
    */
   
    try {
        recipient = await prisma.users.findMany({
            where: {
                role: 'recipient',
                city: {
                    contains: req.body.city
                },
                country: {
                    contains: req.body.country
                },
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                story: true,
                picture: true,
                country: true,
                city: true,
                charity_id_recipient: true
            },
        });

        if (recipient.length > 0) {
            res.json({ recipient });
        } else {
            res.status(404).json({ message: 'No recipients found in this location.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while searching recipients on the database.'});
    }


});

router.get('/:id', addReqToUser, getUserRecipientById);

router.get('/transactions/:id', addReqToUser, authnJWT, authz, getCombinedDataByRecipientId);

router.post('/new', upload.single('image'), newRecipient)

router.put('/update/:id',addReqToUser, authnJWT, authz, updateRecipient)

export default router;