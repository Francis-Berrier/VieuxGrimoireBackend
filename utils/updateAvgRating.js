const prisma = require('../config/prisma');
const createError = require('./createError')

exports.updateAvgRating = async (bookId) => {
    try{
        const avgResult = await prisma.rating.aggregate({
            where: { bookId: bookId, },
            _avg: { rating: true, }
        });
        const averageRating = avgResult._avg.rating ?? 0;
        const updatedBook = await prisma.book.update({
            where: { id: bookId, },
            data: { averageRating: averageRating, }
        });
        return updatedBook;

    } catch{
        throw createError(500, 'Erreur updateAvgRating');
    }
};