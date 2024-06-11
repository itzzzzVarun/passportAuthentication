const express = require('express')
const path = require('path')
const users = require('./routes/users')
const index = require('./routes/index')
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');



 
const app = express();

//DB config
const db = require('./config/key').MongoURI;


//connection to mongo
mongoose.connect(db)
.then(() => console.log('MongoDB Connected...'))
.catch(error => console.log(error)) 




//EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts)

//Bodyparser
app.use(express.urlencoded({ extended: false }));

//Express session MiddleWare
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport config
require('./config/passport')(passport);

//Connect flash
app.use(flash());

//Global variables
app.use((req,res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//Routes
app.use('/', index)
app.use('/users', users)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server started on PORT ${PORT}`))
