const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
   amt:{
       type: String,
       required: true
   },
   currencyType:{
       type: String,
       require: true
   },
   user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' // collection name
   } 
}, {timestamps: true});

const Deposit = mongoose.model('deposit', depositSchema);
module.exports = Deposit;