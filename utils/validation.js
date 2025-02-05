export const isEmailValid = (email) => {
    if (typeof email !== 'string') { return false; }
    if (!email.includes('@')) { return false; }
    if (email.length < 3 || email.length > 320) { return false; }
    return true;
};

export const isPasswordValid = (password) => {
    if (typeof password !== 'string') { return false; }
    if (password.length < 8 || password.length > 128) { return false; }
    return true;
};

export const isIdValid = (userId) => {
    if (typeof userId !== 'number') { return false; }
    if (!Number.isInteger(userId)) { return false; }
    return true;
};

export const isNameValid = (name) => {
    if (typeof name !== 'string') { return false; }
    if (name.length < 1 || name.length > 50) { return false; }
    return true;
};

export const isAgreeToTermsValid = (agreeToTerms) => {
    if (typeof agreeToTerms !== 'boolean') { return false; }
    return true;
};

export const isRoleValid = (role) => {
    const allowedRoles = ['donor', 'recipient', 'charity, business'];  // For security, users with role 'admin' must be manually created by the database administrator
    if (typeof role !== 'string') { return false; }
    if (!allowedRoles.includes(role)) { return false; }
    return true;
};

export const isStatusValid = (status) => {
    const allowedStatus = ['unverified', 'active', 'suspended', 'deleted'];
    if (typeof status !== 'string') { return false; }
    if (!allowedStatus.includes(status)) { return false; }
    return true;
};

export const isIntroductionValid = (introduction) => {
    if (typeof introduction !== 'string') { return false; }
    return true;
};

export const isSocialLInkValid = (social_link) => {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (typeof social_link !== 'string') { return false; }
    if (!urlRegex.test(social_link)) { return false; }
    return true;
};

export const isPictureValid = (picture) => {
    if (picture == null) {
      return false;
    }
    if (!(picture.mimetype == "image/png" || picture.mimetype == "image/jpg" || picture.mimetype == "image/jpeg")) {
      return false;
    }
    return true;
};

export const isAddressLine2Valid = (line2) => {
if (!(line2 !== 'string' || line2 !== null)) { return false; }
return true;
}

export const isCurrencyValid = (currency) => {
    // Check if currency is a string
    if (typeof currency !== 'string') {
        return false;
    }
    // Check if currency is one of the allowed values
    const validCurrencies = ['gbp', 'eur', 'usd'];
    if (!validCurrencies.includes(currency.toLowerCase())) {
        return false;
    }
    return true;
};

export const isPaymentFrequencyValid = (frequency) => {
    // Check if frequency is a string
    if (typeof frequency !== 'string') {
        return false;
    }
    // Check if frequency is one of the allowed values
    const validFrequencies = ['week', 'month', 'quarter'];
    if (!validFrequencies.includes(frequency.toLowerCase())) {
        return false;
    }
    return true;
};
