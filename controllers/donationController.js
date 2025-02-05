import { getDonationImpactDB, newDonationDB } from "../models/donationModel.js";
import { newPayment, oldPayment } from "../routes/api/v1/stripe/payment.js";
import { isIdValid, isNameValid } from "../utils/validation.js";

const newDonation = async(req, res) =>{
    /*
    #swagger.summary = 'Create new donation'
    #swagger.description = 'Endpoint to create new donation by donor'
    #swagger.parameters['Request body'] = {
        in: 'body',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                donor_id: { type: 'integer' },
                charity_id: { type: 'integer' },
                recipient_id: { type: 'integer' },
                amount_donation: { type: 'number' },
                customer_email: { type: 'string', format: 'email' },
                currency: { type: 'string' },
                ios: {type: 'boolean'}
            },
            required: ['donor_id', 'charity_id', 'recipient_id', 'amount_donation', 'customer_email', 'currency', 'ios']
        }
    }
    #swagger.responses[201] = { schema: { message: 'Ok.' } }
    #swagger.responses[400] = { schema: { message: '...depends on which error occurred...' } }
    #swagger.responses[500] = { schema: { message: 'An error occurred while saving the user to the database.' } }
*/

    let invalidMessage = '';
    invalidMessage += isIdValid( req.body.donor_id ) ? '' : 'Invalid input for Donor Id .';
    invalidMessage += isIdValid( req.body.charity_id ) ? '' : 'Invalid input for Charity Id .';
    invalidMessage += isIdValid( req.body.recipient_id ) ? '' : 'Invalid input for Recipien Id .';
    if (invalidMessage) {
        return res.status(400).json({ invalidMessage });
    }

    try {
        let payment;
        const donation = await newDonationDB(req.body);
        if(req.body.ios){
            payment = await oldPayment(req.body.amount_donation, req.body.customer_email, donation.id, req.body.currency);
        }else{
            payment = await newPayment(req.body.amount_donation, req.body.customer_email, donation.id, req.body.currency);
        }
        res.status(201).json(payment);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'An error occured while saving the donation to the database.',
        });
    }
};

const getDonationImpact = async (req, res) => {
    /*
        #swagger.summary = 'Get impact results'
        #swagger.description = 'Endpoint to retrieve donation impact data, including the count of paid donations and unique recipients.'
        #swagger.responses[200] = {
            description: 'Successfully retrieved donation impact data.',
            schema: {
                ugTotalDonationsCount: 150,
                UgTotalHelpedRecipientsCount: 25,
                ugTotalDonationsAmount: 56170.23
            }
        }
        #swagger.responses[500] = {
            description: 'Internal server error occurred.',
            schema: {
                message: 'An error occurred while fetching the donation impact data.'
            }
        }
    */

    try {
        const result = await getDonationImpactDB();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in /impact endpoint:', error.stack);
        res.status(500).json({
            message: 'An error occurred while fetching the donation impact data.',
        });
    }
};

export {newDonation, getDonationImpact};