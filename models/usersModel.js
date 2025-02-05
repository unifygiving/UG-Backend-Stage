import { prisma } from '../db_share.js';
import { UserRole, UserStatus } from '../utils/enums.js';

const getUserPicturebyIdDB = async (id) => {
  try{
    return await prisma.users.findUnique({
      where: { id: id },
      select: { picture: true },
    });
  }catch(error){
    console.log(error)
    throw new Error(`Error geting user picture: ${error.message}`)
  }
};

const updateUserDB = async (id, data) => {
  try{
    return await prisma.users.update({
      where: { id: id },
      data: data,
  });
  }catch(error){
    console.log(error)
    throw new Error(`Error updating user: ${error.message}`)
  }
};

const getUserByIdDB = async (id) => {
  try {
    return await prisma.users.findFirstOrThrow({
      where: { id: id }
    });
  } catch (error) {
    throw new Error(`Error finding user: ${error.message}`);
  }
};

const getUserByQrCodeDB = async (data) => {
  try {
    return await prisma.users.findFirstOrThrow({
      where: { qrcode: data },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        picture: true,
        city: true,
        country: true,
        qrcode: true,
        balance: true        
      }
    });
  } catch (error) {
    throw new Error(`Error finding user: ${error.message}`);
  }
};

const getUserBalanceDB = async (id) => {
  try {
    return await prisma.users.findFirstOrThrow({
      where: { id: id },
      select: {
        id: true,
        balance: true,
        city: true,
        country: true       
      }
    });
  } catch (error) {
    throw new Error(`Error finding user: ${error.message}`);
  }
};

const getUserRecipientByIdDB = async (id) => {
    try {
      return await prisma.users.findUniqueOrThrow({
        where: { 
          id: id,
          role: UserRole.RECIPIENT
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          story: true,
          picture: true,
          country: true,
          city: true,
          charity_id_recipient: true,
          qrcode: true
        }
      })
    } catch (error) {
      throw new Error(`Error finding recipient: ${error.message}`);
    }
}

const newRecipientDB = async (data) => {
  try {
    return await prisma.users.create({
      data: {
        email: data.email.toLowerCase(),
        first_name: data.firstName,
        last_name: data.lastName,
        password: data.password,
        agree_to_terms: data.agreeToTerms,
        role: UserRole.RECIPIENT,
        status: UserStatus.ACTIVE,
        story: data.story,
        city: data.city,
        country: data.country,
        charity_recipient: {
          connect: { id: data.charity_id_recipient },
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

const customUserLoginDB = async (email) => {
  try {
    return await prisma.users.findUnique({
      where: { email: email.toLowerCase()},
      include: { userbusiness: { select: { business_id: true }}}
    });
  } catch (error) {
    throw error;
  }
};

export { getUserPicturebyIdDB, updateUserDB, getUserByIdDB, getUserByQrCodeDB, getUserBalanceDB, getUserRecipientByIdDB, newRecipientDB, customUserLoginDB}