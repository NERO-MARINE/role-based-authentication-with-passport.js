const router = require('express').Router();
const User = require('../model/user');
const mongoose = require('mongoose');
const {roles} = require('../controllers/authorization');




router.get('/dashboard', (req,res)=>{
    res.render('admin_dashboard');
})


router.get('/users', async(req, res)=>{
    try{
       const allusers = await User.find();
        //  res.send(allusers);

      res.render('manage_users', {title: 'Manage_ users', allusers})
    }
    catch(err){
        console.log(err)
    }
})


router.get('/user/:id', async(req,res)=>{
    try{
       const id = req.params.id;
       // we need mongoose to validate this id
       if(!mongoose.Types.ObjectId.isValid(id)){
         req.flash('error', 'Invalid id');
         res.redirect('/admin/users');
         return;
       }
       const person = await User.findById(id);
       res.render('profile', {title: 'User_profile', person})
    }
    catch(err){
        console.log(err)
    }
})


router.put('/update-role/:id', async(req,res)=>{
  try{
      const id = req.params.id;
      const {role} = req.body;

      // check for roles in req.body
      if(!role){
          req.flash('error', 'invalid request');
          res.redirect('back');
          return;
      }

      // check for valid mongoose id
      if(!mongoose.Types.ObjectId.isValid(id)){
          req.flash('error', 'Invalid id');
          res.redirect('back');
          return;
        }

      // check for valid role
      const rolesValues = Object.values(roles);
      if(!rolesValues.includes(role)){
          req.flash('error', 'Invalid role');
          res.redirect('back');
          return;
      }


      // Admin cannot remove themselves from admin
       if(req.user.id === id){
          req.flash('error', 'Admins cannot remove themselves. Ask another admin');
          res.redirect('back');
          return;
       }  

      // update the user
       const user = await User.findByIdAndUpdate(id, {role: role}, {new: true, runValidators: true} )
       req.flash('info', `updated role for ${user.email} to ${user.role}`)
      // console.log(id)
      res.redirect('back')
  }
  catch(err){
      console.log(err)
  }
})


module.exports = router