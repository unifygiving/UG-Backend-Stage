import { prisma } from '../db_share.js';

const getDonationByCharityIdDB = async (id) => {
    try{
        return await prisma.donation.findMany({
            where: { charity_id: id },
        });
    }catch(error){
        console.log(error)
        throw new Error(`Error finding donation: ${error.message}`);
    }
};

const newDonationDB = async (data) => {
    try{
        return await prisma.donation.create({
            data: {
                donor: { connect:{ id: data.donor_id }},
                charity: { connect:{ id: data.charity_id }},
                recipient: { connect:{ id: data.recipient_id}},
                amount_donation: data.amount_donation,
                message: data.message,
            },
            include:{
                donor: true,
                charity: true,
                recipient: true
            }
        });
    }catch(error){
        console.log(error)
        throw new Error(`Error creating donation: ${error.message}`);
    }
};

const getDonationByRecipientIdDB = async (id) => {
    try {
        return await prisma.donation.findMany({
            where: {
                recipient_id: id,
                payment: {
                    status: 'paid'
                }
            }
        });
    } catch (error) {
        throw new Error(`Error finding donation: ${error.message}`);
    }
};

const getDonationImpactDB = async () => {
    try {
        const paidDonationsCount = await prisma.donation.count({
            where: {
                payment: {
                    status: 'paid'
                },
            }
        });

        const paidDonationsAmount = await prisma.donation.aggregate({
            _sum: {
                amount_donation: true
            },
            where: {
                payment: {
                    status: 'paid'
                },
            }
        });

        const uniqueRecipientsCount = await prisma.donation.groupBy({
            by: ['recipient_id'],
            _count: {
                recipient_id: true,
            },
        });

        return { ugTotalDonationsCount: paidDonationsCount, UgTotalHelpedRecipientsCount: uniqueRecipientsCount.length, ugTotalDonationsAmount: Number(paidDonationsAmount._sum.amount_donation || 0 ) }
    } catch (error) {
        console.error('Error fetching donation impact:', error.stack);
        throw new Error(`Error finding donation impact: ${error.message}`);
    }
};


export { getDonationByCharityIdDB, newDonationDB, getDonationByRecipientIdDB, getDonationImpactDB }