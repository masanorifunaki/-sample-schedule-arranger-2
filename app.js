'use strict';
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');

// MARK: モデルの読み込み
const User = require('./models/user');
const Schedule = require('./models/schedule');
const Availability = require('./models/availability');
const Candidate = require('./models/candidate');
const Comment = require('./models/comment');

User.sync().then(() => {
  Schedule.belongsTo(User, {
    foreignKey: 'createdBy',
  });
  Schedule.sync();
  Comment.belongsTo(User, {
    foreignKey: 'userId',
  });
  Comment.sync();
  Availability.belongsTo(User, {
    foreignKey: 'userId',
  });
  Candidate.sync().then(() => {
    Availability.belongsTo(Candidate, {
      foreignKey: 'candidateId',
    });
    Availability.sync();
  });
});

const GitHubStrategy = require('passport-github2').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/github/callback',
},
function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    // ユーザーの保存
    User.upsert({
      userId: profile.id,
      username: profile.username,
    }).then(() => {
      done(null, profile);
    });
  });
}
));

const index = require('./routes/index');
const login = require('./routes/login');
const logout = require('./routes/logout');

const app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'e55be81b307c1c09',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// MARK: ルーター設定
app.use('/', index);
app.use('/login', login);
app.use('/logout', logout);

app.get('/auth/github',
  passport.authenticate('github', {
    scope: ['user:email'],
  }, function(req, res) {})
);

app.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
  }),
  function(req, res) {
    res.redirect('/');
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
