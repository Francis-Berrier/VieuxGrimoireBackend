const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.generateToken = (userId) => {
    return jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET,
        { expiresIn: '24h'}
    )
};