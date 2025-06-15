const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const UserModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');
const tokenService = require('../services/tokenService');
const authService = require('../services/authService');
const redis = require("../redis");

const createUser = catchAsync(async (req, res) => {
  try {
    const appuser = await UserModel.findOne({ email: req.body.email }).exec()
    if (appuser) {
      if (req.body.googleUser == true) {
        const token = await tokenService.generateAuthTokens(appuser, 'appuser');
        res.status(200).send({ appuser, token: token.access.token, refresh: token.refresh.token });
        return;
      }
      throw new ApiError(httpStatus.BAD_REQUEST, 'Account is already created! Please Sign In');
    }
    function genRandomId() {
      const id = Math.random().toString().slice(2, 11);
      return id.substring(0, 3) + '-' + id.substring(3, 6) + '-' + id.substring(6, 9);
    }
    let user = {};
    if (req.body.googleUser == true) {
      user = new UserModel({
        name: req.body.name,
        email: req.body.email,
        googleUser: true,
        personalMeetingId: genRandomId()
      });
    } else {
      user = new UserModel({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        personalMeetingId: genRandomId()
      });
    }
    const userData = await user.save();
    const token = await tokenService.generateAuthTokens(userData, 'appuser');
    res.status(201).send({ appuser: userData, token: token.access.token, refresh: token.refresh.token });
  } catch (error) {
    throw new Error(error.message);
  }
});

const signInUser = catchAsync(async (req, res) => {
  const signinUser = await UserModel.findOne({
    email: req.body.email
  }).exec();

  const isMatch = await signinUser?.isPasswordMatch(req.body.password);

  if (!signinUser || !isMatch) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Email or Password. Please Retry !!');
  } else {
    const token = await tokenService.generateAuthTokens(signinUser, 'appuser');
    res.status(200).send({ appuser: signinUser, token: token.access.token, refresh: token.refresh.token });
  }
});

const getProfile = catchAsync(async (req, res) => {
  const userProfile = await authService.getAppUserById(req.appuser.id)
  res.status(200).send(userProfile);
});

const updateProfile = catchAsync(async (req, res) => {
  await redis.del(`identity_${req.appuser.id}`);
  const user = await authService.updateAppUserById(req.appuser.id, req.body);
  res.status(200).send(user);
});

module.exports = {
  createUser,
  signInUser,
  getProfile,
  updateProfile
};
