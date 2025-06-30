const express = require("express");
const path = require("path");

const router = express.Router();

router.route("/").get((req, res) => {
  if (process.env.NODE_ENV === "development") {
    res.sendFile(path.join(`${__dirname}/../../frontend/src/price.html`));
  } else {
    res.status(200).json({ message: "Price route is active" });
  }
});

module.exports = router;
