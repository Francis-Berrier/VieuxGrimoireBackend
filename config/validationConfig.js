module.exports = {
    email : {
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        errorMessage: "L'adresse email est invalide"
    },
    password : {
        minLength : 8,
        requireUppercase: true,
        requireLowercase: true, 
        requireNumber: true,
        requireSpecialchar: true,
        errorMessage: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un caractère spécial et un chiffre"
    }
};