// Load environment variables from the .env file, where API keys and passwords are configured
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});


var express = require('express');
var cors = require('cors');  // Import CORS middleware
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRoutes = require('./routes/authRoutes');
var categoryRoutes = require('./routes/categoryRoutes');
var productRoutes = require('./routes/productRoutes');
var exchangeRoutes = require('./routes/exchangeRoutes');
var userRoutes = require('./routes/userRoutes');

var app = express();
// Enable CORS for all origins
app.use(cors());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Declaring the routes here
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/users', userRoutes);


module.exports = app;
