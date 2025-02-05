import { prisma } from "../db_share.js";

const createTransactionDB = async (data) =>{
    try {
        const transaction = await prisma.transaction.create({
            data:{
                amount: data.amount,
                user_id: data.user_id,
                business_id: data.business_id,
                products: data.products,
                receipt: "NEED TO IMPLEMENT"
            }
        });
        return transaction;
    } catch (error) {
        throw new Error(`Error creating transaction: ${error.message}`);
    }
};

const getTransactionByRecipientIdDB = async (id) =>{
    try {
        return await prisma.transaction.findMany({
            where: {user_id: id},
            include:{
                business:{
                    select:{
                        name: true,
                    }
                }
            }
        })
    } catch (error) {
        throw new Error(`Error finding transaction: ${error.message}`);
    }
};

export {createTransactionDB, getTransactionByRecipientIdDB}