const mongoose = require('mongoose');
const rules = require('../config/validationConfig');

const userSchema = mongoose.Schema({
    email:{ 
        type: String, 
        required: true, 
        match: rules.email.regex, 
        unique: true
    },
    password:{ 
        type: String, 
        required: true,
        minlength: rules.password.minLength,
        unique: true
    }
});

module.exports = mongoose.model('User', userSchema);