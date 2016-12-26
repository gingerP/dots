const IOC = req('server/constants/ioc.constants');
const GOOGLE_CODE = IOC.AUTH.GOOGLE;
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

function GoogleAuth() {

}

GoogleAuth.prototype.initStrategy = function initStrategy() {
    passport.use(new GoogleStrategy({
            clientID: this.AUTH_CONFIG.CLIENT_ID,
            clientSecret: this.AUTH_CONFIG.CLIENT_SECRET,
            callbackURL: this.AUTH_CONFIG.CALLBACK_URL
        },
        (accessToken, refreshToken, profile, calback) => {
            this.authDB
                .getByAuthIdType(profile.id, GOOGLE_CODE)
                .then(function (err, user) {
                    return calback(err, user);
                });
        }
    ));
};

GoogleAuth.prototype.initApi = function initApi(app) {
    app.get('/auth/google',
        passport.authenticate('google', {scope: ['profile']}));

    app.get('/auth/google/callback',
        passport.authenticate('google', {failureRedirect: '/login'}),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });
};

GoogleAuth.prototype.getName = function getName() {
    return IOC.AUTH.GOOGLE;
};

GoogleAuth.prototype.postConstructor = function (ioc) {
    this.AUTH_CONFIG = ioc[IOC.COMMON.AUTH_CONFIG][GOOGLE_CODE];
    this.authDB = ioc[IOC.DB_MANAGER.AUTH];
    this.server = ioc[IOC.COMMON.WEB];
    this.initStrategy();
    this.initApi(this.server.app);
};

module.exports = {
    class: GoogleAuth
};