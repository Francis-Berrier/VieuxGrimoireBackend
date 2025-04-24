const Book = require('../models/Book');
const fs = require('fs');
const{ updateAvgRating }= require('../utils/updateAvgRating')


exports.getBooks = async (req, res, next) =>{
    try{
        const books = await Book.find();
        return res.status(200).json(books);
    } catch(error){
        return res.status(500).json({ error });     
    }
};
exports.getOneBook = async (req, res, next) =>{
    try {
        const book = await Book.findOne({ _id: req.params.id});
        return res.status(200).json(book);

    } catch(error) {
        return res.status(400).json({ error })
    }
};
exports.getBestBooks = async (req, res, next) =>{
    try {
        const bestBooks = await Book.find()
        .sort({ averageRating: -1})
        .limit(3);
        return res.status(200).json(bestBooks);

    } catch(error){
        return res.status(400).json({ error });
    }
};
exports.createBook = async (req, res, next) =>{
    try {
        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject.userId;
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });
        try{
            const updatedBook = await book.save();
            const savedBook = await updateAvgRating(updatedBook);
            res.status(200).json(savedBook);
        } catch {
            fs.unlink(`images/${req.file.filename}`, () => {});
            const error = new Error();
            error.statusCode= 500;
            throw error;
        }

    } catch (error) {
        res.status(error.statusCode || 400).json({message: error.message});
    }
};

exports.rateOneBook = async (req, res, next) =>{
    try{
        const existingRating = await Book.findOne({ _id: req.params.id, 'ratings.userId': req.auth.userId });
        if(existingRating) {
            const error = new Error('Vous avez déjà noté le livre');
            error.statusCode= 403;
            throw error;
        }
        const userId = req.auth.userId;
        const grade = req.body.rating;
        if (typeof grade !== 'number' || grade < 0 || grade > 5) {
            const error = new Error('Note invalide');
            error.statusCode= 400;
            throw error;
        }
        await Book.updateOne(
            { _id: req.params.id },
            {
                $push: {
                    ratings: {
                        userId: userId,
                        grade: grade
                    }
                }
            }
        );
        const updatedBook = await Book.findById(req.params.id);
        const savedBook = await updateAvgRating(updatedBook);
        res.status(200).json(savedBook);
    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message});
    }
};

exports.changeOneBook = async (req, res, next) =>{
    try {
        const bookObject = req.file? {
            ...JSON.parse(req.body.book),  
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
        } : { ...req.body };
        delete bookObject._userId;
    
        const bookToUpdate = await Book.findOne({_id: req.params.id});
    
            if(bookToUpdate.userId != req.auth.userId) {
                if(req.file){
                    fs.unlink(`images/${req.file.filename}`, () => {});
                }
                const error = new Error();
                error.statusCode= 401;
                throw error;
            } else {
                try {
                    if (req.file) {
                        const oldFilename = bookToUpdate.imageUrl.split('/images/')[1];
                        fs.unlink(`images/${oldFilename}`, () => {});
                    }
                    await Book.updateOne({ _id : req.params.id }, { ...bookObject, _id: req.params.id });
                    return res.status(200).json({ message: 'Livre Modifié!'});
                } catch (error) {
                    const err = new Error(error.message);
                    err.statusCode = 400;
                    throw err;
                }
            }

    }catch(error) {
       return res.status(error.statusCode || 500).json({message: error.message});
    }
};
exports.deleteBook = async (req, res, next) =>{
    try {
        const bookToDelete = await Book.findOne({ _id : req.params.id });
    
        if(bookToDelete.userId != req.auth.userId) {
            const error = new Error('Not authorized');
            error.statusCode= 401;
            throw error;   
        } else {
            const filename = bookToDelete.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, async () => {
                try {
                    await Book.deleteOne({ _id : req.params.id });
                    return res.status(200).json({ message: 'Objet Supprimé!'});

                }catch (error){
                    const err = new Error(error.message);
                    err.statusCode= 400;
                    throw err;   
                }
            });
        };

    }catch(error) {
        return res.status(error.statusCode || 400).json({ error });
    }

};