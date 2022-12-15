//passport js
const passport = require('passport');
//passport-local strategy
const localStrategy = require('passport-local').Strategy;
// User model
const User = require('../model/user');

passport.use(
    new localStrategy({
        usernameField: 'email',
        password: 'password',
    }, async(email, password, done)=>{
       try{
          const user = await User.findOne({email});
          // if user does not exist
          if(!user){
            return done(null, false, {message: 'email is not registered'})
            // error : null, user: false, flash message
          }

          // if email exist: verify password
          // password here is the password the user is trying to use to authenticate
          if (user.password !== password) {
            return done(null, false, { message: "Incorrect Username or password" });
               // error : null, match: false, flash message
          }
          return done(null, user);
       }
       catch(err){
          done(err)
       }
    })
)

// SERIALIZE USER
passport.serializeUser(function(user, done){
    done(null, user.id);
});

//DESERIALIZE USER
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
      done(err, user);
  })
})