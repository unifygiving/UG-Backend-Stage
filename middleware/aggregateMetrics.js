import { prisma } from '../db_share.js';

export const aggregateMetrics = async (req, res, next) => {
    const id = parseInt(req.params.id);

    let user = null;
    try {
        user = await prisma.users.findUniqueOrThrow({
            where: { id },
            include: {
                donations_given: { where: { payment: { status: 'paid' } } },
                donations_received: { where: { payment: { status: 'paid' } } },
            },
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(400).json({ message: 'User not found.' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving user.' });
    }

    const donationsGiven = user.donations_given;
    const donationsGivenSum = donationsGiven.reduce((sum, donation) => sum + parseFloat(donation.amount_donation), 0);
    const donationsGivenCount = donationsGiven.length;

    const donationsCharityIds = donationsGiven.map((donation) => donation.charity_id);
    const supportCount = new Set(donationsCharityIds).size;

    const donationsReceived = user.donations_received;
    const donationsReceivedSum = donationsReceived.reduce((sum, donation) => sum + parseFloat(donation.amount_donation), 0);
    const donationsReceivedCount = donationsReceived.length;

    let citiesAndCountries = [];
    try {
        const donations = await prisma.donation.findMany({
            where: {
                id: { in: donationsGiven.map((donation) => donation.id) },
                payment: { status: 'paid' },
            },
            include: {
                charity: {
                    select: { city: true, country: true },
                },
            },
        });

        const grouped = donations.reduce((acc, donation) => {
            const city = donation.charity?.city || 'Unknown';
            const country = donation.charity?.country || 'Unknown';
            const key = `${city},${country}`;

            if (!acc[key]) {
                acc[key] = { city, country, donationCount: 0 };
            }
            acc[key].donationCount += 1;

            return acc;
        }, {});

        citiesAndCountries = Object.values(grouped);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error aggregating donation data.' });
    }

    // Add metrics to the req object for use in the next middleware/handler
    req.donationsGivenSum = donationsGivenSum;
    req.donationsGivenCount = donationsGivenCount;
    req.supportCount = supportCount;
    req.donationsReceivedSum = donationsReceivedSum;
    req.donationsReceivedCount = donationsReceivedCount;
    req.citiesAndCountries = citiesAndCountries;

    next();  // Pass control to the next middleware or route handler
};
