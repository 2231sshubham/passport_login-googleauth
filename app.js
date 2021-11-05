const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {sequelize,User} = require('./models')
const cookieSession = require('cookie-session')
const config = require('./config')

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(cookieSession({
  name: 'tuto-session',
  keys: ['key1', 'key2']
}))

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user);
});

passport.use(new GoogleStrategy({
    clientID: config.clientID,
    clientSecret: config.client_secret,
    callbackURL: config.redirect_uris,
    passReqToCallback: true
  },
  function (request, accessToken, refreshToken, profile, cb) {
    User.create({name:profile.emails[0].value})
    return cb(null, profile);
  }
));

app.get('/login', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    res.redirect('/success');
  }
);

app.get("/success",(req,res) => {
  res.json({msg:"Google login success"});
})
  
app.listen(3000,async () => {
  console.log("Server started");
  await sequelize.authenticate();
  console.log("DB connected!");
})
