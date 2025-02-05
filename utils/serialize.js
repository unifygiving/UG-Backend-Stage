export const serializeUser = (user) => {
    return {
        id: user.id,
        google_id: user.google_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
        story: user.story,
        balance: user.balance,
        city: user.city,
        country: user.country,
        picture: user.picture,
        qrcode: user.qrcode,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        charity_id_admin: user.charity_id_admin ? user.charity_id_admin : undefined,
        charity_id_recipient: user.charity_id_recipient ? user.charity_id_recipient : undefined,
        donations_given: user.donations_given ?.map((donation) => donation.id),
        donations_received: user.donations_received ?.map((donation) => donation.id),
        businesses: user.businesses ?.map((business) => business.id)
    };
};

export const serializeAddress = (address) => {
    return {
        id: address.id,
        type: address.type,
        line1: address.line_1,
        line2: address.line_2,
        city: address.city,
        postalCode: address.postal_code,
        countryCode: address.country_code,
        userId: address.user_id,
        createdAt: address.created_at,
        updatedAt: address.updated_at
    };
};

export const serializeCharity = (charity) => {
    return{
        id: charity.id,
        name: charity.name,
        desciption: charity.desciption,
        address: charity.address_,
        city: charity.city,
        country: charity.country,
        postal_code: charity.postal_code,
        contact: charity.contact,
        picture: charity.picture,
        social_link: charity.social_link,
        user_id_admin: charity.user_id_admin ? charity.user_id_admin : null,
        userRecipient: charity.user_recipient?.map((user) => user.id),
        createdAt: charity.created_at,
        updatedAt: charity.updated_at,
        donation: charity.donation?.map((donation) => donation.id)
    };
};

export const serializeDonation = (donation) => {
    return{
        id: donation.id,
        donor_id: donation.user?.map((user) => user.id),
        charity_id: donation.charity?.map((charity) => charity.id),
        recipient_id: donation.user?.map((user) => user.id),
        amount_donation: donation.amount_donation,
        message: donation.message,
        payment_id: donation.payment_id,
        createdAt: donation.createdAt,
        updatedAt: donation.updatedAt
    };
};

export const serializePayment = (payment) => {
    return {
        id: payment.id,
        currency: payment.currency,
        amount: payment.amount,
        email: payment.email,
        paymentId: payment.payment_id,
        donation_id: payment.donation_id ? payment.donation_id : null ,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
        status: payment.status,
        payment_intent_id: payment.payment_intent_id,
    };
};

export const serializePaymentIntent = (paymentintent) => {
    return {
        id: paymentintent.id,
        payment_intent: paymentintent.payment_intent,
        payload: paymentintent.payload,
        createdAt: paymentintent.created_at
    };
};

export const serializeBusiness = (business) => {
    return {
        id: business.id,
        name: business.name,
        description: business.description,
        products: business.products,
        createdAt: business.created_at,
        updatedAt: business.updated_at,
        users: business.users ?.map((user) => user.id),
    };
};

export const serializeTransaction = (transaction) => {
    return {
        id: transaction.id,
        amount: transaction.amount.toNumber(),
        created_at: transaction.created_at,
        user_id: transaction.user_id,
        business_id: transaction.business_id,
        products: transaction.products,
        receipt: transaction.receipt,
    };
};