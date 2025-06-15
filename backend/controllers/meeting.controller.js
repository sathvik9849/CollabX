const catchAsync = require('../utils/catchAsync');
const MeetingModel = require('../models/meetingModel');
const redis = require('../redis');

const addMeeting = catchAsync(async (req, res) => {
    try {
        const meeting = await MeetingModel({
            meetId: req.body.meetingId,
            userId: req.body.userId,
            user: req.appuser._id,
            participants: [req.body.userId]
        });
        const appuser = req.appuser._id;
        const meetingData = await meeting.save();
        await redis.del(`MeetingDetails:${appuser}`);
        res.status(201).send(meetingData);
    } catch (error) {
        throw new Error(error.message);
    }
});

const getMeeting = catchAsync(async (req, res) => {
    try {
        const appuser = req.appuser._id;
        const cachedMeetings = await redis.get(`MeetingDetails:${appuser}`);
        if(cachedMeetings){
            res.status(200).send(JSON.parse(cachedMeetings));
            return;
        }
        const meetings = await MeetingModel.find({ user: appuser });
        await redis.set(`MeetingDetails:${appuser}`, JSON.stringify(meetings), 'EX', 60 * 30);
        res.status(200).send(meetings);
    } catch (error) {
        throw new Error(error.message);
    }
});

module.exports = {
    addMeeting,
    getMeeting
};