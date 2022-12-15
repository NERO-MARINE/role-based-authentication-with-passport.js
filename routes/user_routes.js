const express = require('express');

const router = express.Router();

router.get('/profile', (req, res) => {
    // console.log(req.user)
    const person = req.user
    res.render('profile', {title: 'Profile', person})
});


module.exports = router;
