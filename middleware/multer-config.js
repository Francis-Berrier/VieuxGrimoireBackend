const multer = require('multer');
const { storage, fileFilter, limits } = require('../config/uploadConfig')

const upload = multer({ 
    storage, 
    fileFilter, 
    limits 
}).single('image');

module.exports = (req, res, next) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(err.statusCode || 500).json({ message: err.message });
        }
        next();
    });
};