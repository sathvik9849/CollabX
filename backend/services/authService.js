const TokenModel = require("../models/tokenModel");
const jwt = require('jsonwebtoken');
const config = require("../config/config");
const tokenService = require("../services/tokenService");
const UserModel = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const redis = require("../redis");

const refreshAuth = async (token) => {
    try {
        const { tokenFor } = jwt.decode(token);
        const payload = jwt.verify(token, config.jwt[`${tokenFor}Secret`]);
        const tokenDoc = await TokenModel.findOne({ token, type: 'refresh', user: payload.sub });
        if (!tokenDoc) {
            throw new Error('Token not found');
        }
        let user = await getAppUserById(tokenDoc.user);
        if (!user) {
            throw new Error('Unauthorized access');
        }
        await tokenDoc.remove();
        return tokenService.generateAuthTokens(user, tokenFor);
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
};

const logout = async (refreshToken, accessToken) => {
    const refreshTokenDoc = await TokenModel.findOne({ token: refreshToken, type: 'refresh' });
    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    if (accessToken) await redis.srem(`ACCESSTOKEN_${refreshTokenDoc.user}`, accessToken);
    await refreshTokenDoc.remove();
};

const getAppUserById = async (id) => {
    const userProfile = JSON.parse(await redis.get(`identity_${id}`));
    if (userProfile) {
        return userProfile;
    }
    return UserModel.findById(id);
};

const updateAppUserById = async (userId, updateBody) => {
    const user = await UserModel.findOneAndUpdate(
        { _id: userId },
        {
            $set: { ...updateBody },
        },
        { new: true }
    );

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

module.exports = {
    refreshAuth,
    logout,
    getAppUserById,
    updateAppUserById
}