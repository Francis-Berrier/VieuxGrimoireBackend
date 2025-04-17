const Book = require('../models/Book')


exports.getBooks = (req, res, next) =>{
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
exports.getOneBook = (req, res, next) =>{
    Book.findOne({ _id: req.params.id})
    .then(book => res.status(200).json(book))
    .catch(error => res.status(400).json({ error }));
};
exports.getBestBooks = (req, res, next) =>{
    Book.find()
    .sort({ averageRating: -1})
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
exports.createBook = (req, res, next) =>{
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject.userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        rating: [],
        averageRating: 0
    });
    book.save()
    .then(() => res.status(201).json({message: 'Livre enregistré'}))
    .catch(error => res.status(400).json({ error }));

};
exports.rateOneBook = (req, res, next) =>{
    Book.findOne({ _id: req.params.id, 'ratings.userId': req.auth.userId })
    .then(book => {
        if (book) {
            return res.status(403).json({ message: 'Vous avez déjà noté le livre' });

        } 
        const userId = req.auth.userId;
        const grade = req.body.rating;
        if (grade !== 'number' || grade < 0 || grade > 5) {
            return res.status(400).json({ message: 'Note invalide'});
        }
        Book.updateOne(
            { _id: req.params.id },
            {
                $push: {
                    ratings: {
                        userId: userId,
                        grade: grade
                    }
                }
            }
        )
        .then(() => {
            return Book.findById(req.params.id);
        })
        .then(book => {
            const total = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
            const avg = total / book.ratings.length;

            book.averageRating = avg;
            return book.save();
        })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));

};
exports.changeOneBook = (req, res, next) =>{

};
exports.deleteBook = (req, res, next) =>{

};