const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const UserModel = require('../models/userModel');
const redis = require('../redis');

const getIdentity = async (Model, identityId) => {
    let identity = JSON.parse(await redis.get(`identity_${identityId}`));
    if (!identity) {
        identity = await Model.findById(identityId);
        if (!identity) {
          throw new Error('Identity not found');
        }
        await redis.set(`identity_${identity._id}`, JSON.stringify(identity));
      }
      return identity;
};


const jwtAppUserOptions = {
    secretOrKey: config.jwt.appuserSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    passReqToCallback: true,
};

const jwtAppUserVerify = async (req, payload, done) => {
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            throw new Error('Invalid token type');
        }
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

        const tokenInRedis = await redis.sismember(`ACCESSTOKEN_${payload.sub}`, token);
        if (!tokenInRedis) throw new Error('Invalid token');

        const appuser = await getIdentity(UserModel, payload.sub);
        done(null, appuser);
    } catch (error) {
        done(error, false);
    }
};

const jwtStrategyForAppUser = new JwtStrategy(jwtAppUserOptions, jwtAppUserVerify);

module.exports = {
    jwtStrategyForAppUser,
};
