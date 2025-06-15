const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON.plugin');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
      minlength: 8,

      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    personalMeetingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    googleUser: {
      type: Boolean,
      default: false
    },
    profileUrl: {
      type: String,
    },
    isProfilePic: {
      type: Boolean,
      default: false,
    },
    referralCode: {
      type: String,
    },
    referralRedeemCode: {
      type: String,
    },
    starBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.googleUser && !user.password) {
    throw new ApiError('password is empty');
  }
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.plugin(toJSON);

/**
 * @typedef UserModel
 */
const UserModel = mongoose.model('Users', userSchema);

module.exports = UserModel;
