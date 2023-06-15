const mongoose = require('mongoose');
const {roles} = require('../controllers/authorization');

// Specify admin Email
ADMIN_EMAIL = 'oghenerookerri@gmail.com';


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    }, 

    username:{
        type: String,
        required: true
    },

    password:{
        type: String,
        required: true
    },
    amount:{
        type: String,
        default: null
    },
    denomination:{
        type: String,
        default: null
    },
    image:{
        type: String,
        default: null
    },
    role:{
        type: String,
        enum: [roles.admin, roles.moderator, roles.client],
        default: roles.client
    },
    deposits:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'deposit' // collection name
        }
    ],
}, {timestamps:true})


// use pre-hook to check if user emailis === ADMIN_EMAIL
userSchema.pre('save', async function(next){
    try{
        // isNew is a mongoose property
       if(this.isNew){
        // check if admin
        if(this.email === ADMIN_EMAIL.toLowerCase()){
            this.role = roles.admin;
        }
       }
       next()
    }
    catch(err){
        console.log(err);
    }
 })
 

const User = mongoose.model('user', userSchema);
module.exports = User;