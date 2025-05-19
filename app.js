const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const httpLogger = require('./middleware/loggerMiddleware')

const app = express();
app.use(httpLogger);


app.use(cors({
    origin: '*',
    methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS' ],
    allowedHeaders: [ 'Origin', 'X-Requested-With', 'Content',' Accept', 'Content-Type', 'Authorization' ]
}));

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);


module.exports = app;