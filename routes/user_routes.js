const express = require('express');
const router = express.Router();
const User = require('../model/user');
const Deposit = require('../model/deposits')
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');


// set up multer
let storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    },
    // file name for uploaded files
    filename: function(req,file,cb){
        // cb(null, file.fieldname+'_'+Date.now()+'_'+file.originalname);
        cb(null, file.fieldname+'_'+file.originalname);
    }
})

let upload = multer({
    storage: storage,
}).single('image');



router.get('/profile', (req, res) => {
    // console.log(req.user)
    const person = req.user
    res.render('profile', {title: 'Profile', person})
});


//get edit profile
router.get('/update_profile/:id', async(req,res)=>{
     try{
        const id = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(id)){
             res.redirect('back');
             return;
        }
       const user_profile = await User.findById(id);
       res.render('update_profile', {title: 'edit_profile',user_profile})  
     }
     catch(err){
         console.log(err);
     }

}) 

// update profile
router.put('/update_profile/:id', upload, async(req,res)=>{
  try{
    const id = req.params.id;
    let new_image = '';
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        res.redirect('/');
        return;
        }

        if(req.file){
            new_image = req.file.filename;
            // remove the old image with fs module
            try{
                if(req.body.old_image !== ''){
                    fs.unlinkSync('./uploads/' +req.body.old_image);
                }
                
            }
            catch(err){
               console.log(err)
            }

        } else{
            new_image = req.body.old_image
        }
      
        const updateUser = await User.findByIdAndUpdate(id, {
            username: req.body.username,
            email: req.body.email,
            denomination: req.body.denomination,
            image: new_image
        }, {new: true})
        req.flash('success', 'User update sucessfully')
        res.redirect('/user/profile');
        
  }

  catch(err){
      console.log(err);
  }
});

router.get('/contact', (req, res)=>{
    res.render('contact');
 });
 
router.post('/contact', (req, res)=>{
     // console.log(req.body);
     const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
           user: 'oghenerookerri@gmail.com',
           pass: 'qmtedgblfmsjmysr',
        }
    })

    const mailOptions = {
        from: req.body.email,
        to: 'oghenerookerri@gmail.com',
        subject: `Message from ${req.body.email}: ${req.body.subject}`,
        text: req.body.message,
        html: `<h1 style="color:green;">My name is: ${req.body.name} and my phone is: ${req.body.phone}.</h1> <p>${req.body.message}</p>`
    }

    transporter.sendMail(mailOptions, (err,info)=>{
        if(err){
            console.log(err);
            res.send('error');
        }else{
            console.log(info.response);
            // res.send('success');
            req.flash('success', 'Message sent successfully');
            res.redirect('/user/contact')
        }
    });


})


// get deposit form
router.get('/deposit', (req,res)=>{
    const person = req.user;
    // res.send(person._id)
    res.render('depositform', {title: 'deposit form', person});
})

// post and save a deposit
router.post('/deposit/:id', async(req,res)=>{
    try{
       const deposit = new Deposit(req.body);
       
       await deposit.save();

       // get user id and push deposit into thr deposit array in the user model

       const id = req.params.id;

       const user = await User.findById(id);

       if(!mongoose.Types.ObjectId.isValid(id)){
        res.redirect('back');
        return;
       };

       if(!user){
           return res.redirect('back')
       };

       user.deposits.push(deposit);

       await user.save();

       req.flash('success', 'Deposit made successfully');
       res.redirect('/user/deposit');
    }

    catch(err){
       console.log(err)
    }
})


// get all deposits
router.get('/alldeposits/:id', async(req,res)=>{
   try{
        const id = req.params.id;

        const user = await User.findById(id).populate('deposits');

        if(!user){
            return res.redirect('back');
        };

        // res.json(user.deposits);
        res.render('alldeposits.ejs', {title: `${user.username} deposits`, user})

   }

   catch(err){
       console.log(err)
   }
})

module.exports = router;
