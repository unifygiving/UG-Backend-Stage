import { prisma } from '../db_share.js';

const findCharityByAdminIdDB = async (user_id_admin) => {
  try {
    return await prisma.charity.findUnique({
      where: { user_id_admin },
    });
  } catch (error) {
    throw new Error(`Error finding charity: ${error.message}`);
  }
};

const createCharityDB = async (data) => {
  try {
    const charity = await prisma.charity.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        country: data.country,
        postal_code: data.postal_code,
        contact: data.contact,
        social_link: data.social_link,
        user_admin: {
          connect: {
            id: data.user_id_admin,
          },
        },
      },
      include: { user_admin: true },
    });

    await prisma.users.update({
      where: { id: data.user_id_admin },
      data: { charity_id_admin: charity.id },
    });

    return charity;
  } catch (error) {
    throw new Error(`Error creating charity: ${error.message}`);
  }
};

const getAllCharitiesDB = async () => {
  try {
    return await prisma.charity.findMany();
  } catch (error) {
    throw new Error(`Error retrieving charities: ${error.message}`);
  }
};

const getCharityIdDB = async (id) => {
  try{
    return await prisma.charity.findUnique({
      where: { id: id },
      include: { user_recipient: true }
    });
  }catch(error){
    throw new Error(`Error finding charity: ${error.message}`)
  }
};

const updateCharityDB = async (id, updateData) => {
  try {
    return await prisma.charity.update({
      where: { id },
      data: updateData
    });
  } catch (error) {
    throw new Error(`Error updating charity: ${error.message}`);
  }
};

const deleteCharityDB = async (id) => {
  try {
    return await prisma.charity.delete({
      where: { id: id },
    });
  }catch ( error ){
    throw new Error (`Error deleting charity: ${error.message}`)
  }
};

const uploadCharityPictureDB = async (id, fileName) => {
  try{
    return await prisma.charity.update({
      where: {
        id: id,
      },
      data: {
        picture: fileName,
      },
    });
  }catch(error){
    throw new Error(`Error updating charity picture: ${error.message}`);
  }
};

const getCharityByLocationDB = async (city, country) => {
  try {
    return await prisma.charity.findMany({
      where: {
        city: {
          contains: city.trim(),
          mode: 'insensitive'
        },
        country: {
          contains: country.trim(),
          mode: 'insensitive'
        },
      },
      include: {
        user_recipient: true,
      },
    });
  } catch (error) {
    throw new Error(`Error retrieving charities: ${error.message}`);
  }
};

export { findCharityByAdminIdDB, createCharityDB, getAllCharitiesDB, getCharityIdDB, updateCharityDB, deleteCharityDB, uploadCharityPictureDB, getCharityByLocationDB };