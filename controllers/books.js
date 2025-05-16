
const prisma = require('../config/prisma');
const fs = require('fs').promises;
const createError = require('../utils/createError');
const{ updateAvgRating }= require('../utils/updateAvgRating');
const { validateCreateBookData, validateUpdateBookData } = require('../utils/validateBookData');
const logger = require('../config/logger');
const { unlink } = require('fs');


exports.getBooks = async (req, res) =>{
    try{
        const books = await prisma.book.findMany();
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
exports.getOneBook = async (req, res) =>{
    try {
        const book = await prisma.book.findUnique({
            where: { id: req.params.id },
        });
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
        const bestBooks = await prisma.book.findMany({
            orderBy: {
                averageRating: 'desc',
            },
            take: 3,
        }); 
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
        const userId = req.auth.userId;

        let bookRating = bookObject.rating;
        delete bookObject.rating;
        if (typeof bookRating !== 'number') throw createError(400, 'Note invalide');
        if (bookRating < 0) bookRating = 0;
        if (bookRating > 5) bookRating = 5;

        bookObject.year = Number(bookObject.year);
        validateCreateBookData(bookObject);
       
        const newBook = await prisma.$transaction(async (tx) => {

            const book = await tx.book.create({
            data:{ 
            ...bookObject,
            userId: userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            averageRating: bookRating
            },
            });

            await tx.rating.create({
                data: {
                    rating: bookRating,
                    userId: userId,
                    bookId: book.id
                },
            });
            return book;
        });
        
        return res.status(201).json(newBook);

    } catch (error) {
        await fs.unlink(`images/${req.file.filename}`);
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
        const bookId = Number(req.params.id);
        const userId = Number(req.auth.userId);
        
        let grade = req.body.rating;
        if (typeof grade !== 'number') throw createError(400, 'Note invalide');
        if (grade < 0) grade = 0;
        if (grade > 5) grade = 5;
        const existingBook = await prisma.book.findUnique({
            where: { id: bookId, },
        });
        if(!existingBook) throw createError(404, 'Livre introuvable');

        const existingRating = await prisma.rating.findFirst({
            where: {
                bookId: bookId,
                userId: userId
            },
        });
        if(existingRating) throw createError(403, 'Livre déjà noté');

        await prisma.rating.create({
            data: {
                rating: grade,
                userId: userId,
                bookId: bookId
            }

        });

        const updatedBook = await updateAvgRating(bookId);
        res.status(200).json(updatedBook);

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

        if(bookObject.rating) {
            delete bookObject.rating;
        }

        const userId  = Number(req.auth.userId);
        const bookId = Number(req.params.id);
        if(bookObject.year){
            bookObject.year = Number(bookObject.year);
        }
        validateUpdateBookData(bookObject);
    
        const bookToUpdate = await prisma.book.findUnique({
            where : { id: bookId },
        });

        if (!bookToUpdate) throw createError(404, `Livre introuvable`);
    
        if(bookToUpdate.userId != userId) {
            if(req.file){
                await fs.unlink(`images/${req.file.filename}`);
            }
            throw createError(401, `Utilisateur non autorisé`); 
        } 
        try {
            if (req.file) {
                const oldFilename = bookToUpdate.imageUrl.split('/images/')[1];
                await fs.unlink(`images/${oldFilename}`);
            }
            await prisma.book.update({
                where: { id: bookId },
                data: {
                    ...bookObject,
                },
            });
        
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
        const bookId = Number(req.params.id);
        const userId = Number(req.auth.userId);

        const bookToDelete = await prisma.book.findUnique({ where: { id : bookId }, });
        if(!bookToDelete) throw createError(404, 'Livre introuvable');
        if(bookToDelete.userId != userId) throw createError(401, 'Non autorisé');
       
        const filename = bookToDelete.imageUrl.split('/images/')[1];

        try{
            await fs.unlink(`images/${filename}`);
        }catch (err) {
            logger.warn(`Image introuvable ou supprimée : ${filename}`) 
        }
        
        await prisma.$transaction([
            prisma.rating.deleteMany({ where: { bookId: bookId } }),
            prisma.book.delete({ where: { id : bookId }, }),
        ]);
       
        return res.status(200).json({ message: 'Objet Supprimé!'});

        
    }catch(error) {
        logger.error(`Erreur deleteBook UserId: ${req.auth.userId}, BookId: ${req.params.id}`, { 
            statusCode: error.statusCode, 
            message: error.message, 
            stack: error.stack 
        });
        return res.status(error.statusCode || 400).json({ error });
    }
};
