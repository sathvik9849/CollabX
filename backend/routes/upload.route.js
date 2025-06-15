const express = require('express');
const multer = require('multer')
const router = express.Router();
const streamifier = require('streamifier');
const config = require('../config/config');
const fileUpload = multer();
const { cloud_name, api_key, api_secret } = config.cloudinary;

router
  .route('/profile')
  .post(fileUpload.single('image'), function (req, res, next) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const cloudinary = require('cloudinary').v2
        cloudinary.config({
          cloud_name: cloud_name,
          api_key: api_key,
          api_secret: api_secret
        })
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      res.send(result);
    }

    upload(req);
  });

module.exports = router;
