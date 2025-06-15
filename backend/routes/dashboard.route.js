const express = require('express');
const path = require('path');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
const router = express.Router();

router
  .route('/')
  .post(userController.createUser);

router
  .route('/logout')
  .post(authController.logout);

router
  .route('/refresh')
  .post(authController.refreshUser);

router
  .route('/')
  .get((req, res) => {
    res.sendFile(path.join(`${__dirname}/../../frontend/src/dashboard.html`));
  });

module.exports = router;
