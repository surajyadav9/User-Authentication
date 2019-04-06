const express = require('express');
const { ensureAuthenticated } = require('../config/auth');

const router = express.Router();

//Welome
router.get('/', (req , res) => res.render('welcome'));

//Dashboard
router.get('/dashboard' , ensureAuthenticated , (req, res) => res.render('dashboard' , {
    user : req.user // when we are logged in , we have access to to the user property
}));



module.exports = router;

