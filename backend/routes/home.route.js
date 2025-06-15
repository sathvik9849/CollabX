const express = require('express');
const path = require('path');
const userController = require('../controllers/user.controller');
const { appUserAuth } = require('../middlewares/auth');
const router = express.Router();

router
  .route('/')
  .get((req, res) => {
    res.sendFile(path.join(`${__dirname}/../../frontend/src/index.html`));
  });

router
  .route('/profile')
  .get(appUserAuth(), userController.getProfile);

router
  .route('/profile')
  .put(appUserAuth(), userController.updateProfile);

module.exports = router;
