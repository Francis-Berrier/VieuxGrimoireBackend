const Book = require('../models/Book');
const fs = require('fs');
const createError = require('../utils/createError');
const{ updateAvgRating }= require('../utils/updateAvgRating');
const { validateCreateBookData, validateUpdateBookData } = require('../utils/validateBookData');
const logger = require('../config/logger');


exports.getBooks = async (req, res, next) =>{
    try{
        const books = await Book.find();
        return res.status(200).json(books);
    } catch(error){
        logger.error(`Erreur getBooks`, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
        });
        return res.status(500).json({ error });     
    }
};
exports.getOneBook = async (req, res, next) =>{
    try {
        const book = await Book.findOne({ _id: req.params.id});
        return res.status(200).json(book);

    } catch(error) {
        logger.error(`Erreur getOneBook livre ${req.params.id}`, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
        });
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
        logger.error(`Erreur getBestBooks:`, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
        });
        return res.status(400).json({ error });
    }
};
exports.createBook = async (req, res, next) =>{
    try {
        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id;
        delete bookObject.userId;
        bookObject.year = Number(bookObject.year);
        validateCreateBookData(bookObject);
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
            throw createError(500, ' échec sauvegarde mongodB');
        }

    } catch (error) {
        logger.error(`Erreur createBook UserId: ${req.auth.userId}`, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
          });
        res.status(error.statusCode || 400).json({message: error.message});
    }
};

exports.rateOneBook = async (req, res, next) =>{
    try{
        const existingRating = await Book.findOne({ _id: req.params.id, 'ratings.userId': req.auth.userId });
        if(existingRating) throw createError(403, 'Livre déjà noté');

        const userId = req.auth.userId;
        const grade = req.body.rating;
        if (typeof grade !== 'number' || grade < 0 || grade > 5) throw createError(400, 'Note invalide');

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
        logger.error(`Erreur rateOneBook UserId: ${req.auth.userId}, BookId: ${req.params.id}`, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
          });
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
        if(bookObject.year){
            bookObject.year = Number(bookObject.year);
        }
        validateUpdateBookData(bookObject);
    
        const bookToUpdate = await Book.findOne({_id: req.params.id});
    
            if(bookToUpdate.userId != req.auth.userId) {
                if(req.file){
                    fs.unlink(`images/${req.file.filename}`, () => {});
                }
                throw createError(401, `Utilisateur non autorisé`); 
            } 
            try {
                if (req.file) {
                    const oldFilename = bookToUpdate.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${oldFilename}`, () => {});
                }
                await Book.updateOne({ _id : req.params.id }, { ...bookObject, _id: req.params.id });
                return res.status(200).json({ message: 'Livre Modifié!'});
            } catch (error) {
                throw createError(400, error.message);
            }
    }catch(error) {
        logger.error(`Erreur changeOneBook UserId: ${req.auth.userId}, BookId: ${req.params.id}`, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
        });
       return res.status(error.statusCode || 500).json({message: error.message});
    }
};
exports.deleteBook = async (req, res, next) =>{
    try {
        const bookToDelete = await Book.findOne({ _id : req.params.id });
        if(bookToDelete.userId != req.auth.userId) throw createError(401, 'Non autorisé');
       
        const filename = bookToDelete.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, async (err) => {
            if (err) throw createError(500, err.message)
            try {
                await Book.deleteOne({ _id : req.params.id });
                return res.status(200).json({ message: 'Objet Supprimé!'});

            }catch (error){
                throw createError(500, error.message);
            }
        });

    }catch(error) {
        logger.error(`Erreur deleteBook UserId: ${req.auth.userId}, BookId: ${req.params.id}`, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
        });
        return res.status(error.statusCode || 400).json({ error });
    }
};
