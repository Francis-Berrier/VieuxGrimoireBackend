const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

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
        res.status(500).json( {error} );

    }
}