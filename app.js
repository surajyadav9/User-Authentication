const express = require('express');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const expressLayouts = require("express-ejs-layouts");
const mongoose = require('mongoose');
const mongoConfig = require('./config/keys');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

const PORT = process.env.PORT || 5000;

//Passport config
require('./config/passport')(passport);

//DB Config
const db = mongoConfig.MongoURI;


//Connnect to MongoDB
mongoose.connect(db , {useNewUrlParser : true})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

//EJS
app.use(expressLayouts);
app.set('view engine' , 'ejs');


//Body-parser
app.use(express.urlencoded({ extended : false}));

//Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true } // change it to true  , when accessing over HTTPS server
}));


//Passport 
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());


//Global vars
app.use((req , res ,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // For Login

    next();
});


//Routes
app.use('/' ,indexRouter);
app.use('/users', usersRouter);


//Server
app.listen(PORT , () => console.log(`Server started on ${PORT}...`));