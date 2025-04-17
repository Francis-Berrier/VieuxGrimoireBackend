const express = require('express');
const booksCtrl = require('../controllers/books');
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth')
const router = express.Router();


router.get('/', booksCtrl.getBooks);
router.get('/:id', booksCtrl.getOneBook);
router.get('/bestrating', booksCtrl.getBestBooks);
router.post('/', auth, multer, booksCtrl.createBook);
router.post('/:id/rating', auth, booksCtrl.rateOneBook);
router.put('/:id', auth, multer, booksCtrl.changeOneBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;
