const jwt = require('jsonwebtoken');
const User = require('../model/users');

module.exports = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authorization header is required' });
    }

    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        req.user = user;

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        return res.status(401).json({ message: 'Token is invalid' });
    }
};
