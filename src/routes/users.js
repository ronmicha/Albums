let express = require('express');
let router = express.Router();
let dbClient = require('../DBClient');
let validator = require('validator');
let cookieParser = require('cookie-parser');
router.use(cookieParser());

router.use(function (req, res, next)
{
    let cookie = req.cookies['AlbumShop'];
    if (cookie && cookie.login.hashCode() === cookie.key)
        next();
    else
        res.redirect('/login');
});

module.exports = router;
