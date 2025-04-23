const multer = require('multer');
const path = require('path');

const MIME_TYPES = {
    'image/jpg' : 'jpg',
    'image/jpeg' : 'jpg',
    'image/png' : 'png'
};

const fileFilter = (req, file, callback) => {
    if(MIME_TYPES[file.mimetype]) {
        callback(null, true);
    } else {
        const error = new Error('Type de Fichier invalide');
        error.statusCode = 415;
        callback( error, false);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = path.parse(file.originalname).name.toLowerCase().split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        if(!extension){
            const error = new Error('Type de Fichier invalide');
            error.statusCode = 415;
            return callback(error, false);
        }
        callback(null, `${name}_${Date.now()}.${extension}`);
    }
});

const upload = multer({ storage, fileFilter }).single('image');

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