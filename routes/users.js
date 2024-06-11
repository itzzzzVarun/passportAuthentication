const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport');
//User Model
const User = require('../models/User');



//login page
router.get('/login', (req, res) => {
    res.render('login')
})

//register page
router.get('/register', (req,res) => {
    res.render('register')
})

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body
    let errors = [];

    //Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({msg : 'Please fill in all fields'})
    }

    //Check passwords match
    if (password !== password2) {
        errors.push({msg: 'Passwords do not match!'})
    }


    //Check password length
    if (password.length < 6) {
        errors.push({msg: 'Password should be atleast 6 characters long!'})
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //Validation Pass
        User.findOne( { email:email } )
        .then(user => {
            if (user) {
                //user already exists
                errors.push({msg: ' Email is alreay registered'})
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });
                    // Hash Password
                    bcrypt.genSalt(10, (error, salt) => {
                        bcrypt.hash(newUser.password, salt, (error, hash) => {
                            if (error) throw error

                            //Set password to hashed
                            newUser.password = hash

                            //save user to database
                            newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and you can login')
                                res.redirect('/users/login')
                            })
                            .catch(error => console.log(error))
                        })
                    })
            }
        });

    }
});

// Login Handle
router.post('/login', (req,res, next) => {
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

//Logout handle
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success_msg', 'You are logged out')
        res.redirect('/users/login');
    });
})

module.exports = router