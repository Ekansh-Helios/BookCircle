import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // Load secret key from .env

const authenticateUser = (req, res, next) => {
    // Get the token from request headers
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Attach user details to the request object
        req.user = decoded;

        next(); // Continue to the next middleware or route handler
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
};

export default authenticateUser;
