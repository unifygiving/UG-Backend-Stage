import { prisma } from '../db_share.js';
import { serializeTransaction } from '../utils/serialize.js';
import { isIdValid } from '../utils/validation.js';

export default async (req, res, next) => {
    // Validate id
    let id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Invalid id. The id is required as a parameter in the URL path." });
    }
    id = parseInt(id, 10);
    if (!isIdValid(id)) {
        return res.status(400).json({ message: 'Invalid id in the URL path parameter.' });
    }

    // Get transaction
    let transaction = null;
    try {
        transaction = await prisma.transaction.findUniqueOrThrow({
            where: {
                id: id
            }
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'A transaction with that id was not found in the database.' });
        }
        console.error(error); 
        return res.status(500).json({ message: 'An error occurred when trying to get the transaction from the database.' });
    }

    // Add transaction to req
    req.transaction = serializeTransaction(transaction);
    next();
};
