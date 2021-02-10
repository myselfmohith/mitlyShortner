const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
mongoose.connect(process.env.DB_URL || "mongodb://localhost/urlShortner", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const UserDB = require("./models/usersDB");
const bcrypt = require("bcrypt");

// Routes ============================

const r1 = require('./routes/route1');

// --------------------------------------------------------

// Passport local Setup ===================================

passport.use(
  new passportLocal({ usernameField: "email" }, (username, password, done) => {
    UserDB.findOne({ email: username }, async (err, user) => {
      if (err) done(err, { message: "USERNAME NOT FOUND" });
      else {
        if (user != null) {
          if (await bcrypt.compare(password, user.password)) done(null, user);
          else done(null, false, { message: "INCORRECT PASSWORD" });
        }
        else done(null, false, { message: "USER NOT FOUND"});
      }
    });
  })
);

// --------------------------------------------------------

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(require("express-ejs-layouts"));
app.use(
  session({
    secret: process.env.MYSECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  UserDB.findById(id, function (err, user) {
    done(err, user);
  });
});

// Middle Ware =======================================

app.use(r1);

// ---------------------------------------------------

app.listen(process.env.PORT || 5000, async () => {
  console.log("SERVER STARTED");
});
