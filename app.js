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

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(
  async function(username, password, done) {
    let user = await User.findOne({where:{ name: username }});
    if(!user){ return done(null,false); }
    let result = await bcrypt.compare(password, user.password);
    if(result){
      return done(null,user);
    }
  }
));

app.post("/register",async (req,res) => {
  const {username,password} = req.body;
  try {
    // const user = await User.findOne({
    //   where: { name },
    // })
    // if(!user){
    //   console.log("hi");
    // }
    // console.log(user);
    // if(!user){
    //   res.redirect("/register")
    // }
    // else{
    //   console.log("hello");
    bcrypt.hash(password, 10,async function(err, hash) {
      if(!err){
        hash = hash.toString();
        let user = await User.create({name:username,password:hash});
        if(user){
          res.redirect("/login")
        }
      }
      else{
        console.log(err);
      }
    });
  } catch (e) {
      res.status(500).json({msg:"Internal server error"});
  }
})

app.post("/login",passport.authenticate('local'),function(req, res) {
    res.json({msg:`Success user`});
  });

  
app.listen(3000,async () => {
  console.log("Server started");
  await sequelize.authenticate();
  console.log("DB connected!");
})
