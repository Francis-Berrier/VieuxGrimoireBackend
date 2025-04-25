const rules = require('../config/validationConfig');

exports.isValidEmail = (email) => {
    return rules.email.regex.test(email);
};

exports.isValidPassword = (password) => {
    const { minLength, requireUppercase, requireLowercase, requireNumber, requireSpecialchar} = rules.password;
    return (
        password.length >= minLength &&
        (!requireUppercase || /[A-Z]/.test(password)) &&
        (!requireLowercase || /[a-z]/.test(password)) &&
        (!requireNumber || /\d/.test(password)) &&
        (!requireSpecialchar || /[^A-Za-z0-9]/.test(password))
      );
};