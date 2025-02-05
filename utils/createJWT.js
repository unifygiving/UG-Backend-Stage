import jwt from 'jsonwebtoken';

export const createJWT = (user) => {
    const payload = { userId: user.id, role: user.role, status: user.status };
    const options = { expiresIn: '4w' };
    return jwt.sign(payload, process.env.JWT_SECRET, options);
};