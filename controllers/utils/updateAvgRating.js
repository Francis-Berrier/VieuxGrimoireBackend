exports.updateAvgRating = async (updatedBook) => {
    try{
        if(!updatedBook.ratings || updatedBook.ratings.length === 0){
            updatedBook.averageRating = 0;
            
        } else{
            const total = updatedBook.ratings.reduce((acc, rating) => acc + rating.grade, 0);
            const avg = total / updatedBook.ratings.length;
            updatedBook.averageRating = avg;
            
        }
        const savedBook = await updatedBook.save();
        return savedBook;

    } catch{
        const error = new Error();
        error.statusCode= 500;
        throw error;
    }
};