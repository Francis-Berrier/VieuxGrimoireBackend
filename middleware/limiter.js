const rateLimit = require('express-rate-limit')

const messageErreur = 'Trop de tentatives, essayez ultérieurement'

const signupLimiter = 
    rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 3,
        message: messageErreur,
        standardHeaders: true,
        legacyHeaders: false
    });
const loginLimiter = 
    rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 5,
        message: messageErreur,
        standardHeaders: true,
        legacyHeaders: false
    });

module.exports = {
    signupLimiter,
    loginLimiter,
}
    
