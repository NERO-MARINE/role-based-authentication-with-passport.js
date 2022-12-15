const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const connectFlash = require('connect-flash');
const port = process.env.PORT || 3000;
const index_routes = require('./routes/index_routes');
const user_routes = require('./routes/user_routes');
const auth_routes = require('./routes/auth_routes');
const admin_routes = require('./routes/admin_routes');
const passport = require('passport');
const passportAuth = require('./controllers/passport_auth');
const connectMongo = require('connect-mongo');
const methodOverride = require('method-override')
const {roles} = require('./controllers/authorization');


const app = express();

// middleware
app.use(express.static('public'));

// view engine
app.set('view engine', 'ejs');

// express Url encoded
app.use(express.urlencoded({extended:true}));

// database connection
const dbconn = 'Put your connectionString'

mongoose.set('useFindAndModify', false);

mongoose.connect(dbconn, {useNewUrlParser: true, useUnifiedTopology:true,useCreateIndex:true})
.then(()=>{
    console.log('connected to db');
    app.listen(port, ()=>{
      console.log(`listening to request at ${port}`)
  })
})
.catch((err)=>{
    console.log(err)
;})

// create MongoStore
const MongoStore = connectMongo(session);


// use/init express session
app.use(session({
  secret: 'My bambi issh good and cool',
  resave: false,
  saveUninitialized: false,
  cookie:{
    // secure: true, //use this on a secure connection(https)
    httpOnly: true // cookies cannot be read by the browser
 
  },
  // use mongoStore
  store: new MongoStore({mongooseConnection: mongoose.connection})
}))

// use passport initialize
app.use(passport.initialize());
// // use passport session
app.use(passport.session());


// middle-ware to put 'user' everywhere in our template
app.use((req,res,next)=>{
  res.locals.user = req.user;
  next();
}) 


// use connect flash
app.use(connectFlash());
// to show messages after redirect: note flash messages can only be used once. If they have not been consumed yet, we can still use them
app.use((req, res, next)=>{
  res.locals.messages = req.flash();
  next();
})

app.use(methodOverride('_method'))
  
// routes
app.use('/', index_routes);
app.use('/user', userIsAuthenticated, user_routes);
app.use('/auth', auth_routes);
app.use('/admin', userIsAuthenticated, userIsAdmin, admin_routes);

app.use((req, res)=>{
  res.status(404).render('404', {title: 'tasty-page'});
})


// middleware to check if user is authenticated
function userIsAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    next()
  }else{
    res.redirect('/auth/login');
  }
}

// check if admin
function userIsAdmin(req,res, next){
  if(req.user.role === roles.admin){
    next()
  }else{
    req.flash('warning', 'You are not authorized to see this route')
    res.redirect('/');
  }
}

// check if moderator
function userIsModerator(req,res, next){
  if(req.user.role === roles.moderator){
    next()
  }else{
    req.flash('warning', 'You are not authorized to see this route')
    res.redirect('/');
  }
}