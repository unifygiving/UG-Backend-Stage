import express from 'express';
import authnJWT from '../../../../middleware/authn.js';
import { prisma } from '../../../../db_share.js';
import addDonationToReq from '../../../../middleware/addDonationToReq.js';
import addUserToReq from '../../../../middleware/addUserToReq.js';
import authz from '../../../../middleware/authz.js';
import { aggregateMetrics } from '../../../../middleware/aggregateMetrics.js';
import { getDonationImpact, newDonation } from '../../../../controllers/donationController.js';

const router = express.Router();
router.use(express.json());
let donation;
let user;

router.post('/', authnJWT, newDonation);

router.get('/impact', getDonationImpact);

router.get('/:id', authnJWT, addDonationToReq, async (req, res, next)=>{
    /*
        #swagger.summary = 'Get donation by id'
        #swagger.description = 'To get donation by id'
        #swagger.security = [{ "JWT_authentication": [] }]
        #swagger.parameters['id'] = { 
        description: 'Donation Id.',
        in: 'path',
        required: true,
      }
    */

    const donationId = parseInt(req.params.id, 10);
    try {
        donation = await prisma.donation.findUniqueOrThrow({
            where:{
                id: donationId
            },
            include:{
                donor: {
                    select:{
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                },
                recipient: {
                    select:{
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                },
                charity: {
                    select:{
                        id: true,
                        name: true,
                    }
                }
            }
        });
        if(donation){
            res.json(donation);
        }else{
            return res.status(404).json({error: "Donation not found"});
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }

    /*
    #swagger.responses[200] = {
      description: "Donation",
      schema: 
      {
        "donation": {
            "id": 2,
            "donor_id": 7,
            "charity_id": 4,
            "recipient_id": 25,
            "amount_donation": "2500",
            "message": "message223366",
            "created_at": "2023-07-28T21:47:49.094Z",
            "updated_at": "2023-07-28T21:47:49.094Z",
            "donor": {
                "id": 7,
                "first_name": "Fake",
                "last_name": "Donor"
            },
            "recipient": {
                "id": 25,
                "first_name": "Jack",
                "last_name": "Doe"
            },
            "charity": {
                "id": 4,
                "name": "Barnabus",
                "description": "A charity which started off with one man walking the streets and giving food to those in need now supports 600 people every week, has been bringing hope to the homeless for the last 25 years. The team at Barnabus have received the unsung heroes Queens Award for Voluntary Service and rely entirely on donations.",
                "address": "61 Bloom Street",
                "city": "Manchester",
                "postal_code": "M1 3LY",
                "contact": "+44 0161 237 3223",
                "social_link": "test",
                "picture": null,
                "user_id_admin": 8,
                "created_at": "2023-07-15T14:37:00.326Z",
                "updated_at": "2023-07-15T14:37:00.326Z"
            }
        }
      }
    }
  */
});

router.get('/donor/:id', authnJWT, addUserToReq, authz, aggregateMetrics, async (req, res, next) => {
    /*
      #swagger.summary = 'Get all donations given by a user'
      #swagger.description = Retrieve all donations given by a user from the database, including aggregated metrics such as total donations amount, donation count, supported charities count, and donation distribution by city and country.'
      #swagger.security = [{ "JWT_authentication": [] }]
      #swagger.parameters['id'] = { 
        description: 'User ID.',
        in: 'path',
        required: true,
        type: 'integer',
      }
      #swagger.responses[200] = {
        description: 'Successfully retrieved donor information and donation metrics.',
        schema: {
          user: {
            id: 11,
            email: 'recipientTest@email.com',
            first_name: 'John',
            last_name: 'Doe',
            city: 'London',
            country: 'UK',
            picture: 'null',
            qr_code: 'null',
            donations_given: [
              {
                id: 1,
                donor_id: 9,
                charity_id: 3,
                recipient_id: 11,
                amount_donation: '20',
                message: 'string123456',
                created_at: '2023-07-28T22:39:06.225Z',
                updated_at: '2023-07-28T22:39:06.225Z',
                payment_id: 94,
                recipient: {
                  first_name: 'Felipe',
                  last_name: 'Gomes',
                  picture: null,
                  city: 'Rio de Janeiro',
                  country: 'Brazil'
                }
              }
            ]
          },
          donationsGivenSum: 20,
          donationsGivenCount: 1,
          supportCount: 1,
          citiesAndCountries: [
            {
              city: 'London',
              country: 'UK',
              donationCount: 2
            }
          ]
        }
      }
      #swagger.responses[404] = {
        description: 'User not found in the database.',
        schema: {
          error: 'User not found in database.'
        }
      }
      #swagger.responses[500] = {
        description: 'Internal server error occurred while retrieving user donations.',
        schema: {
          error: 'Internal server error'
        }
      }
    */
    const userId = parseInt(req.params.id, 10);

    try {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: {
                donations_given: {
                    where: { payment: { status: 'paid' } },
                    include: {
                        recipient: {
                            select: {
                                first_name: true,
                                last_name: true,
                                picture: true,
                                city: true,
                                country: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found in database.' });
        }

        const donationsGiven = user.donations_given;

        // As métricas já foram calculadas pelo middleware 'aggregateMetrics'
        const { donationsGivenSum, donationsGivenCount, supportCount, citiesAndCountries } = req;

        // Prepare user response
        const userRes = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            city: user.city,
            country: user.country,
            picture: user.picture,
            qr_code: user.qr_code,
            donations_given: donationsGiven,
        };

        // Send the complete response
        res.json({
            user: userRes,
            donationsGivenSum,
            donationsGivenCount,
            supportCount,
            citiesAndCountries,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/recipient/:id', authnJWT, addUserToReq, authz, aggregateMetrics, async (req, res, next) => {
/*
    #swagger.summary = 'Get all donations received by a user'
    #swagger.description = To get all donations received by a user from DB
    #swagger.security = [{ "JWT_authentication": [] }]
    #swagger.parameters['id'] = { 
    description: 'User Id.',
    in: 'path',
    required: true,
    }
*/
const userId = parseInt(req.params.id, 10);
console.log(userId)
try {
    user = await prisma.users.findUnique({
        where: { id: userId },
        include: { 
            donations_received: { 
                where: { payment: { status: 'paid' }},
                include: { 
                    donor: {
                        select: {
                            first_name: true,
                            last_name: true,
                            picture: true,
                            city: true,
                            country: true
                        }
                    }
                }
            }
        }
    });

    if (user) {
        const userRes = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            city: user.city,
            country: user.country,
            picture: user.picture,
            qr_code: user.qr_code,
            donations_received: user.donations_received
        };

        res.json({ 
            user: userRes, 
            donationsReceivedSum: req.donationsReceivedSum,
            donationsReceivedCount: req.donationsReceivedCount
        });
    } else {
        return res.status(404).json({ error: 'User not found in database.' });
    }
} catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
}

/*
    #swagger.responses[200] = {
    description: 'Recipient successfully obtained.',
    schema: {
        user: {
        id: 11,
        email: 'recipientTest@email.com',
        first_name: 'John',
        last_name: 'Doe',
        city: 'London',
        country: 'Uk',
        picture: 'null',
        qr_code: 'null',
        donations_received: [
            {
            id: 1,
            donor_id: 9,
            charity_id: 3,
            recipient_id: 11,
            amount_donation: '20',
            message: 'string123456',
            created_at: '2023-07-28T22:39:06.225Z',
            updated_at: '2023-07-28T22:39:06.225Z',
            payment_id: 94,
            donor: {
                first_name: "Felipe",
                last_name: "Gomes",
                picture: null,
                city: "Rio de Janeiro",
                country: "Brazil"
            }
            }
        ]
        }
    }
    }
*/
});

export default router;