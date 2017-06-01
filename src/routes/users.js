let express = require('express');
let dbClient = require('../DBClient');
let validator = require('validator');
let cookieParser = require('cookie-parser');
let router = express.Router();
router.use(cookieParser());

router.use('/reg', function (req, res, next)
{
    let cookie = req.cookies['AlbumShop'];
    if (cookie)
        next();
    else
        res.redirect('/login');
});

router.post('/register', function (req, res, next)
{
    let user = {};
    user.Username = req.body.username;
    user.Password = req.body.password;
    user.Q1Answer = req.body.q1answer;
    user.Q2Answer = req.body.q2answer;
    user.Email = req.body.email;
    user.Country = req.body.country;

    ValidateUserDetails(user);

    dbClient.Register(user).then(function ()
    {
        CreateCookie(res, user);
        res.send('Client added successfully');
    }).catch(function (err)
    {
        next(err);
    })
});

router.post('/login', function (req, res, next)
{
    let a = req.cookies['AlbumShop'];
    res.send(a);
});

function CreateCookie(res, user)
{
    let today = new Date();
    let date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    res.cookie('AlbumShop', {login: user.Username, key: user.Username.hashCode(), lastLogin: date});
}

String.prototype.hashCode = function ()
{
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++)
    {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function ValidateUserDetails(user)
{
    if (validator.isEmpty(user.Username) || !validator.isAlpha(user.Username)
        || !validator.isLength(user.Username, {min: 3, max: 8}))
        throw new Error('Username must be 3-8 characters long containing english letters only');

    if (validator.isEmpty(user.Password) || !validator.isAlphanumeric(user.Password)
        || !validator.isLength(user.Password, {min: 5, max: 10}))
        throw new Error('Password must be 5-10 characters long containing english letters or numbers only');

    if (validator.isEmpty(user.Q1Answer) || validator.isEmpty(user.Q2Answer))
        throw new Error('Both security questions must have answers');

    if (validator.isEmpty(user.Email) || !validator.isEmail(user.Email))
        throw new Error('Email address is not valid');

    // ToDo Check if country exists in XML file
    if (validator.isEmpty(user.Country) || !validator.isAlpha(user.Country))
        throw new Error('Country name is not valid');
}

module.exports = router;
