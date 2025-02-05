import crypto from 'crypto';

export const getTIMESTAMPTZ = () => {
    const date = new Date();
    let offset = -date.getTimezoneOffset() / 60;
    const sign = (offset >= 0) ? '+' : '-';

    offset = Math.abs(offset);
    offset = (offset < 10) ? ('0' + offset) : offset;

    let TIMESTAMPTZ = date.toISOString();
    TIMESTAMPTZ = TIMESTAMPTZ.replace('T', ' ');
    TIMESTAMPTZ = TIMESTAMPTZ.replace('Z', sign + offset);

    return TIMESTAMPTZ;
};

export function generateRandomPassword(lenght){
    return crypto.randomBytes(lenght).toString('hex').slice(0, lenght);
}