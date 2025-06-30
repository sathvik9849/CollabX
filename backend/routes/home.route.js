const express = require("express");
const path = require("path");
const userController = require("../controllers/user.controller");
const { appUserAuth } = require("../middlewares/auth");
const router = express.Router();

router.route("/").get((req, res) => {
  if (process.env.NODE_ENV === "development") {
    res.sendFile(path.join(`${__dirname}/../../frontend/src/index.html`));
  } else {
    res.status(200).json({ message: "CollabX API is running" });
  }
});

router.route("/profile").get(appUserAuth(), userController.getProfile);

router.route("/profile").put(appUserAuth(), userController.updateProfile);

module.exports = router;
