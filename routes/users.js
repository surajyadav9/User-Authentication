const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

//User model
const User = require('../models/User');

//Login 
router.get('/login', (req , res) => res.render('login'));

//Register
router.get('/register', (req , res) => res.render('register'));

//Register Handle
router.post('/register', (req,res) => {
    
    const { name , email , password , password2 } = req.body;
    const errors = [];

    //Check required fiels
    if(!name || !email || !password || !password2){
        errors.push({ msg : 'Please fill in all fields'});
    }

    //Email validation
    const EmailExpression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    if(!EmailExpression.test(String(email).toLowerCase())){
        errors.push({ msg : 'Please use valid email address.'});
    }
    
    //Password validation
        //Minimum eight characters, at least one letter, one number and one special character:
        const PassExpression = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if(!PassExpression.test(password) || !PassExpression.test(password2) ){
            errors.push({ msg : 'Please enter a valid password' });
        }


        //Check Password match
        if(password !== password2){
            errors.push({ msg : 'Password do not match' });
        }



    if(errors.length >0){
        res.render('register', {
            errors:errors, 
            name:name,
            email:email,
            password:password,
            password2:password2
        });
    }
    else{
        //Validation passes
        User.findOne({emai : email})
            .then(user => {
                if(user){
                    //User exist
                    //re-render the register page 
                    errors.push({msg : 'Email is already registered'});
                    res.render('register', {
                        errors, 
                        name,
                        email,
                        password,
                        password2
                    });  
                }
                else{
                    const newUser = new User({
                       name,
                       email,
                       password
                    });

                    //Hash password
                    bcrypt.genSalt(10 , (err , salt) => {
                        bcrypt.hash(newUser.password , salt ,(err , hash) => {
                            
                            if(err) throw err;
                            //set password to hashed
                            newUser.password = hash;
                            
                            // Save User
                            newUser.save()
                                .then(user => {

                                    // redirect to login page               
                                    req.flash('success_msg','You are successfully registered and can log in');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            });
    }

});


//Login Handle
router.post('/login' , (req , res ,next) => {

    passport.authenticate('local' ,{
        successRedirect : '/dashboard',
        failureRedirect : '/users/login',
        failureFlash : true
    })(req ,res ,next);

});

//Logout Handle
router.get('/logout' , (req, res) => {
    req.logout();
    req.flash('success_msg','You are successfully logged out');
    res.redirect('/users/login');
});


module.exports = router;

