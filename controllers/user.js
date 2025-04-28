const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const rules = require('../config/validationConfig');
const { isValidEmail, isValidPassword} = require('../utils/validators');
const createError = require('../utils/createError');
const {generateToken} = require('../utils/generateToken');
const logger = require('../config/logger');


exports.signup = async (req, res, next) =>  {
    try {
        const {email, password}= req.body;

        if(!isValidEmail(email)) throw createError(400, rules.email.errorMessage);
        if (!isValidPassword(password)) throw createError(400, rules.password.errorMessage);

        const existingUser = await User.findOne({ email: email });
        if(existingUser) throw createError(400, 'Cet utilisateur existe déjà');
            
        const hash =  await bcrypt.hash(password, 10);
        const user = new User({
            email: email,
            password: hash
        });
        await user.save();
        return res.status(201).json({message: 'Utilisateur créé'});
        
    } catch (error){
        logger.error(`Erreur signup Email: ${req.body.email}`, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
        });
        res.status(error.statusCode || 500).json({message: error.message});
    }
};

exports.login = async (req, res, next) => {

    try {
        const {email, password}= req.body;
      
        if(!isValidEmail(email)) throw createError(400, rules.email.errorMessage);
        if (!isValidPassword(password)) throw createError(400, rules.password.errorMessage);

        const user = await User.findOne({ email: email});
        if(!user) throw createError(401, 'Utilisateur Inconnu');

        const checkPassword = await bcrypt.compare(password, user.password);
        if(!checkPassword) throw createError(401, 'Erreur de Mot de Passe');

        return res.status(200).json({ 
            userId: user._id,
            token: generateToken(user._id)
        });

    }catch(error) {
        logger.error(`Erreur login Email: ${req.body.email}`, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
        });
        res.status(error.statusCode || 500).json({message: error.message});
    }   
};