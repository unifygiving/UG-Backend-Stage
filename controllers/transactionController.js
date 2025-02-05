import { prisma } from "../db_share.js";
import { getBusinessByIdDB } from "../models/businessModel.js";
import { getUserByQrCodeDB } from "../models/usersModel.js";

const newTransaction = async (req, res) => {
    /*
        #swagger.summary = 'Creates a new transaction (needs business id as a parameter)'
        #swagger.description = "Creates a new transaction between a user and a business. All parameters are required, id is the business id"
        #swagger.security = [{ "JWT_authentication": [] }]
        #swagger.parameters['Request body'] = {
            in: 'body',
            schema: {
                qrcode: '123456',
                amount: 25.5,
                products: 'Cofee, Bread'
            }
        }
        #swagger.responses[200] = { schema: { message: 'Transaction completed successfully.', transaction_id: 15 } }
        #swagger.responses[400] = { schema: { message: 'recipient_id, business id, amount, and products are required.' } }
        #swagger.responses[404] = { schema: { message: 'User or Business not found.' } }
        #swagger.responses[500] = { schema: { message: 'Error: <error_message>' } }
    */

    if (!req.body.qrcode || !req.business.id || !req.body.amount || !req.body.products) {
        return res.status(400).json({ message: "qrcode, business id, amount, and products are required." });
    }

    try {
        const user = await getUserByQrCodeDB(req.body.qrcode);

if (user.balance < req.body.amount) {
    return res.status(400).json({ error: `Insufficient balance. £${user.balance}` });
}

const business = await getBusinessByIdDB(req.business.id);
if (!business) {
    return res.status(404).json({ error: 'Business not found' });
}

const [updatedUser, updatedBusiness, transaction] = await prisma.$transaction([
    prisma.users.update({
        where: { id: user.id },
        data: {
            balance: {
                decrement: req.body.amount,
            },
        },
    }),

    prisma.business.update({
        where: { id: req.business.id },
        data: {
            balance: {
                increment: req.body.amount,
            },
        },
    }),

    prisma.transaction.create({
        data: {
            amount: req.body.amount,
            user_id: user.id,
            business_id: req.business.id,
            products: req.body.products || "",
            receipt: req.body.receipt || null,
        },
    }),
]);

res.status(200).json({ 
    message: 'Transaction completed successfully.',
    transaction_id: transaction.id,
});

        
    } catch (error) {
        console.log(error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'User or Business not found.' });
        }
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

export { newTransaction };