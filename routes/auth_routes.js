const express = require('express');
const {body, validationResult} = require('express-validator');
const passport = require('passport');
const nodemailer = require('nodemailer');

const router = express.Router();

// user Model
const User = require('../model/user');

router.get('/login', userNotAuthenticated, (req, res) => {
    res.render('login', {title: 'login'});
});

router.post('/login', userNotAuthenticated, passport.authenticate('local',{
    /* successRedirect: '/user/profile',*/
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
}));

router.get('/register', userNotAuthenticated, async(req, res) => {
    res.render('register', {title: 'register'});
});

router.post('/register', userNotAuthenticated,[
// Validation for Email
body('email').trim().isEmail().withMessage('Email must be a valid email').normalizeEmail().toLowerCase(),
// validation for password;
body('password').trim().isLength(5).withMessage('Minimum Password length is 5'),
// validation for username;
body('username').trim().isLength(6).withMessage('Minimum Userame length is 6'),
// validation for password and confirm password match
body('confirm_password').custom((value, {req})=>{
  if(value !== req.body.password){
      throw new Error('Passwords do not match')
  }
  return true;
})
], 
async(req, res) => {
   try{
        // Check for errors
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            // console.log(errors);
            errors.array().forEach((error)=>{
                req.flash('error', error.msg)
            })
            res.render('register', {title: 'register', email: req.body.email, messages: req.flash() });
            return;
        }
     // check if email exist
     const {email} = req.body;
     const isExisting = await User.findOne({email});
     if(isExisting){
         req.flash('info', 'Email already exists');
         res.redirect('/auth/register');
         return; // This will prevent the next code from running; which is o create a new user
     }

     const user = new User(req.body);
    // const user = new User({
    //     'email' : req.body.email,
    //     'username' : req.body.username,
    //     'password' : req.body.password,
    //     'amount' : '0:00',
    //     'denomination' : '#',
    //     'image': 'upload image'
    // })
    await user.save();

    // console.log(req.body);

    //  sending email after sign up
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: 'oghenerookerri@gmail.com',
         pass: 'qmtedgblfmsjmysr',
      }
  })

  const mailOptions = {
      from: 'oghenerookerri@gmail.com',
      to: req.body.email,
      subject: `Message from codeNero website`,
      text: `Hello`,
      html: `<h1> welcome to this website. Your signup is sucessful</h1>`
  }

   transporter.sendMail(mailOptions, (err,info)=>{
       if(err){
           console.log(err);
           res.send('error');
       }else{
           console.log(info.response);
           // res.send('success');
           req.flash('success', 'Message sent successfully');
           res.redirect('/contact')
       }
   });

  //  sending email after sign up


    // res.send(user);
    req.flash('success', `${user.email} registered sucessfully. You can now login`);
    res.redirect('/auth/login');
   }
   catch(err){
       console.log(error);
   }
});

// Logout
router.get('/logout', userIsAuthenticated, (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });

module.exports = router;

// check if user is authenticated
function userIsAuthenticated(req,res,next){
    if(req.isAuthenticated()){
      next()
    }else{
      res.redirect('/auth/login');
    }
  }

// check if user is not authenticated

function userNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
      res.redirect('back')
    }else{
      next();
    }
  }