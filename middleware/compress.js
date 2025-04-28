const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

module.exports = async (req, res, next) => {
    if(!req.file) {
       return next();
    }
    
    const name = path.parse(req.file.filename).name;
    const extension = 'webp';
    const fileName = `${name}.${extension}`;
    const outputPath = path.join('images', fileName);

    try{
        await sharp(req.file.path)
        .resize({ width: 400 })
        .webp({ quality: 70 })
        .toFile(outputPath);

        fs.unlinkSync(req.file.path);

        req.file.filename = fileName;
        next();

    } catch (error) {
        logger.error(`Erreur compress 500 `, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
        });
        res.status(500).json( {error} );

    }
}