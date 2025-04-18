const express = require('express');
const booksCtrl = require('../controllers/books');
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');
const compress = require('../middleware/compress')
const router = express.Router();


router.get('/', booksCtrl.getBooks);
router.get('/bestrating', booksCtrl.getBestBooks);
router.get('/:id', booksCtrl.getOneBook);
router.post('/', auth, multer, compress, booksCtrl.createBook);
router.post('/:id/rating', auth, booksCtrl.rateOneBook);
router.put('/:id', auth, multer, compress, booksCtrl.changeOneBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;
