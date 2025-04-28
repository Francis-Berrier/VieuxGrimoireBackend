const jwt = require('jsonwebtoken');
require('dotenv').config();
const logger = require('../config/logger');

module.exports = (req, res, next) => {

    try{
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET); 
        const userId = decodedToken.userId; 
        req.auth = {
            userId: userId
        };
        next();

    } catch(error){
        logger.error(`Erreur auth 401 `, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
        });
        res.status(401).json({error});
    }
};