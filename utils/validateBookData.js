const createError = require('./createError');


function validateCreateBookData(book) {
    const { title, author, year, genre } = book;
  
    if (!title || typeof title !== 'string') throw createError(400, 'Titre invalide');
    if (!author || typeof author !== 'string') throw createError(400, 'Auteur invalide');
    if (!year || typeof year !== 'number' || year > new Date().getFullYear()) throw createError(400, 'Année invalide');
    if (!genre || typeof genre !== 'string') throw createError(400, 'Genre invalide');
  
    return true;
  };

function validateUpdateBookData(book) {
const { title, author, year, genre } = book;

if (title && typeof title !== 'string') throw createError(400, 'Erreur validateUpdateBookData: Titre invalide');
if (author && typeof author !== 'string') throw createError(400, 'Erreur validateUpdateBookData: Auteur invalide');
if (year && (typeof year !== 'number' || year > new Date().getFullYear())) throw createError(400, 'Erreur validateUpdateBookData: Année invalide');
if (genre && typeof genre !== 'string') throw createError(400, 'Erreur validateUpdateBookData: Genre invalide');

return true;
};

module.exports = {
    validateCreateBookData,
    validateUpdateBookData
};