const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON.plugin');
const meetingSchema = new mongoose.Schema(
  {
    meetId: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Users',
      required: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    endAt: {
      type: Date
    },
    participants: {
      type: Array,
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
meetingSchema.plugin(toJSON);

/**
 * @typedef MeetingModel
 */
const MeetingModel = mongoose.model('Meetings', meetingSchema);

module.exports = MeetingModel;