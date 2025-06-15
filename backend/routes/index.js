const express = require('express');
const prices = require('./prices.route');
const home = require('./home.route');
const upload = require('./upload.route');
const signup = require('./signUp.route');
const signin = require('./signIn.route');
const dashboard = require('./dashboard.route');
const meeting = require('./meeting.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/',
    route: home,
  },
  {
    path: '/upload',
    route: upload,
  },
  {
    path: '/meeting',
    route: meeting,
  },
  {
    path: '/signup',
    route: signup,
  },
  {
    path: '/signin',
    route: signin,
  },
  {
    path: '/dashboard',
    route: dashboard,
  },
  {
    path: '/prices',
    route: prices,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
