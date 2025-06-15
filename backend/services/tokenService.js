const moment = require('moment');
const jwt = require('jsonwebtoken');
const { tokenTypes } = require('../config/tokens');
const TokenModel = require('../models/tokenModel');
const config = require('../config/config');
const redis = require('../redis');

const generateToken = (userId, expires, type, tokenFor) => {
    const secret = config.jwt[`${tokenFor}Secret`] || config.jwt.appuserSecret;

    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
        tokenFor,
    };
    return jwt.sign(payload, secret);
};


const generateAuthTokens = async (user, tokenFor) => {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(user._id, accessTokenExpires, tokenTypes.ACCESS, tokenFor);
    await redis.sadd(`ACCESSTOKEN_${user.id}`, accessToken);
    await redis.expire(`ACCESSTOKEN_${user.id}`, config.jwt.accessExpirationMinutes * 60);
    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH, tokenFor);

    await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH, tokenFor);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

const generateGoogleRefreshToken = async (accessToken, user, tokenFor) => {
    await redis.sadd(`ACCESSTOKEN_${user.id}`, accessToken);
    await redis.expire(`ACCESSTOKEN_${user.id}`, config.jwt.accessExpirationMinutes * 60);
    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH, tokenFor);

    await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH, tokenFor);

    return {
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

const saveToken = async (token, userId, expires, type, tokenFor) => {
    const tokenDoc = await TokenModel.updateOne(
        { user: userId },
        { $set: { token, user: userId, expires: expires.toDate(), type, tokenFor } },
        { upsert: true },
    ).exec();
    return tokenDoc;
};


module.exports = {
    generateAuthTokens,
    generateGoogleRefreshToken
};