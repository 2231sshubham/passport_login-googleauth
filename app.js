const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const {sequelize,User} = require('./models')
const session = require("express-session");
const config = require('./config')

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(session({secret: "secret"}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: config.clientID,
  clientSecret: config.client_secret,
  callbackURL: config.redirect_uris,
  accessType: "offline",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
  (accessToken, refreshToken, profile, cb) => {
         cb(null, extractProfile(profile));
}));

passport.serializeUser((user, cb) => {
          cb(null, user);
});
passport.deserializeUser((obj, cb) => {
          cb(null, obj);
});



app.get("/login", passport.authenticate('google', {
  scope: ['email', 'profile']
}), (req, res) => {});



app.get("/success",(req,res) => {
  res.json({msg:"Google login success"});
})

  
app.listen(3000,async () => {
  console.log("Server started");
  await sequelize.authenticate();
  console.log("DB connected!");
})
