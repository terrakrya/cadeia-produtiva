const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const User = mongoose.model('User')

passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    function (username, password, done) {
      User.findOne({ username })
        .then(function (user) {
          if (!user || !user.validPassword(password)) {
            return done(null, false, {
              errors: { 'username or password': 'is invalid' },
            })
          }
          return done(null, user)
        })
        .catch(done)
    }
  )
)
