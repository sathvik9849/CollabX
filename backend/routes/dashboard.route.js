const express = require("express");
const path = require("path");
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.route("/").post(userController.createUser);

router.route("/logout").post(authController.logout);

router.route("/refresh").post(authController.refreshUser);

router.route("/").get((req, res) => {
  if (process.env.NODE_ENV === "development") {
    res.sendFile(path.join(`${__dirname}/../../frontend/src/dashboard.html`));
  } else {
    res.status(200).json({ message: "Backend is live" });
  }
});

module.exports = router;
