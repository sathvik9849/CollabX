const GoogleStrategy = require('passport-google-oauth20').Strategy;

const config = require('./config');

function extractProfile(profile,accessToken,refreshToken) {
    let imageUrl = '';
    if (profile.photos && profile.photos.length) {
        imageUrl = profile.photos[0].value;
    }
    return {
        id: profile.id,
        email: profile.emails[0]?.value,
        displayName: profile.displayName,
        image: imageUrl,
        accessToken,
        refreshToken
    };
}
const googleStrategy = new GoogleStrategy({
    clientID: config.google['clientId'],
    clientSecret: config.google['secret'],
    callbackURL: config.google['callback'],
    accessType: 'offline',
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
},(accessToken, refreshToken, profile, cb) => {
        cb(null, extractProfile(profile,accessToken,refreshToken));
});

module.exports = {
    googleStrategy,
};