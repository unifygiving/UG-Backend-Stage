import { prisma } from '../db_share.js';
import { serializeDonation } from '../utils/serialize.js';
import { isIdValid } from '../utils/validation.js';


export default async (req, res, next) => {
    // Validate id
    let id = req.params.id;
    if (!id) { return res.status(400).json({ message: "Invalid id. The id is required as a parameter in the URL path." }); }
    id = Math.round(id);
    if (!isIdValid(id)) { return res.status(400).json({ message: 'Invalid id in the URL path parameter.' }); }

    // Get donation
    let donation = null;
    try {
        donation = await prisma.donation.findUniqueOrThrow({
            where: {
                id: id
            }
        });
    } catch (error) {
        if (error.code === 'P2025') { return res.status(400).json({ message: 'An donation with that id was not found in the database.' }); }
        console.log(error);
        return res.status(500).json({ message: 'An error occured when trying to get the donation from the database.' });
    }

    // Add donation to req
    req.donation = serializeDonation(donation);
    next();
};