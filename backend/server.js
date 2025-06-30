const express = require('express');
var favicon = require('serve-favicon')
const xss = require('xss-clean');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const passport = require('passport');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error');
const { jwtStrategyForAppUser } = require('./config/passport');
const ApiError = require('./utils/ApiError');
const httpStatus = require('http-status');
const { googleStrategy } = require('./config/googleStrategy');
const server = express();

server.use(express.json()); // middleware line1  parse JSON body
server.use(express.urlencoded({ extended: true })); // middleware line2  parse url body

// sanitize request data
server.use(xss());
server.use(mongoSanitize());

// parse json request body
server.use(express.json());

// enable cors
server.use(cors());
server.options('*', cors());

// jwt authentication
server.use(passport.initialize());
passport.use('google',googleStrategy)
passport.use('jwtappuser', jwtStrategyForAppUser);

if (process.env.NODE_ENV === 'development') {
  server.use(express.static(path.join(__dirname, '/../frontend/src/')));
  server.use(favicon(path.join(__dirname, '/../frontend/src/favicon/favicon.ico')));
}


// server.use(express.static(path.join(__dirname, '/../frontend/src/')));
// server.use(favicon(path.join(__dirname, '/../frontend/src/favicon/favicon.ico')));

server.use('/', routes);

// 404 error for unavailable routes
server.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found 404'));
});

// convert error to ApiError, if needed
server.use(errorConverter);

// handle error
server.use(errorHandler);

module.exports = server;
