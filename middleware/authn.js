import jwt from 'jsonwebtoken';

export default function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) { return res.status(400).json({ message: 'Authorization header is undefined. Did you forget to add the authorization header to your request?' }); }

    const token = authHeader.split(' ')[1];
    if (!token) { return res.status(400).json({ message: 'The token in the authorization header is invalid. Make sure to set the authorization header to a valid JWT.' }); }

    let decodedPayload = {};
    try {
        decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
        }
        console.log(error);
        return res.status(500).json({ message: 'An error occured while trying to verify a session token.' });
    }

    req.jwtPayload = decodedPayload;
    next();
};