const express = require("express");
const meetingController = require("../controllers/meeting.controller");
const { appUserAuth } = require("../middlewares/auth");
const path = require("path");

const router = express.Router();

router.route("/addMeeting").post(appUserAuth(), meetingController.addMeeting);

router.route("/getMeetings").get(appUserAuth(), meetingController.getMeeting);

router.route("/").get((req, res) => {
  if (process.env.NODE_ENV === "development") {
    res.sendFile(path.join(`${__dirname}/../../frontend/src/meeting.html`));
  } else {
    res.status(200).json({ message: "Meeting route is active" });
  }
});

module.exports = router;
