const FacebookStrategy = require('passport-facebook').Strategy;
module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
    passport.use(new FacebookStrategy({
            clientID: "487713388466874",
            clientSecret:"c723a99b55e9b8706736e8662044bf39",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },
        (token, refreshToken, user, done) => {
            return done(null, {
                profile: user,
                token: token
            });
        }));
};