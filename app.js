// Load environment variables from the .env file, where API keys and passwords are configured
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});


var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRoutes = require('./routes/authRoutes');

var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Declaring the routes here
app.use('/api/auth', authRoutes);


module.exports = app;
