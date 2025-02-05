import { prisma } from '../db_share.js';

const createBusinessDB = async (data, id) =>{
    try{
        const business = await prisma.business.create({
            data:{
                name: data.name,
                description: data.description,
                products: data.products,
                category: data.category,
                address: data.address,
                post_code: data.post_code,
                city: data.city,
                country: data.country
            }
        });

        await prisma.userbusiness.create({
            data:{
                user_id: id,
                business_id: business.id
            }
        });

        return business;
    }catch(error){
        throw new Error(`Error creating business: ${error.message}`);
    }
};

const getBusinessByIdDB = async (id) =>{
    try{
        return await prisma.business.findUniqueOrThrow({ where: {id: id} });
    }catch(error){
        throw new Error(`Error creating business: ${error.message}`);
    }
}
export { createBusinessDB, getBusinessByIdDB };