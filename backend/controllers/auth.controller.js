const catchAsync = require('../utils/catchAsync');
const authService = require('../services/authService');
const { ExtractJwt } = require('passport-jwt');

const refreshUser = catchAsync(async (req, res) => {
    const tokens = await authService.refreshAuth(req.body.refreshToken);
    res.status(200).send(tokens);
});

const logout = catchAsync(async (req, res) => {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    await authService.logout(req.body.refreshToken, token);
    res.status(204).send();
});

module.exports = {
    refreshUser,
    logout,
}