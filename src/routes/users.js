let express = require('express');
let dbClient = require('../DBClient');
let validator = require('validator');
let router = express.Router();

router.get('/', function (req, res, next)
{

});

router.post('/register', function (req, res, next)
{
    let user = {};
    user.Username = req.body.username;
    if (validator.isEmpty(user.Username) || !validator.isAlpha(user.Username)
        || !validator.isLength(user.Username, {min: 3, max: 8}))
        throw new Error('Username must be between 3-8 characters containing english letters only');

    user.Password = req.body.password;
    if (validator.isEmpty(user.Password) || !validator.isAlphanumeric(user.Password)
        || !validator.isLength(user.Password, {min: 5, max: 10}))
        throw new Error('Password must be 5-10 characters containing english letters or numbers only');

    user.Q1Answer = req.body.q1answer;
    user.Q2Answer = req.body.q2answer;
    if (validator.isEmpty(user.Q1Answer) || validator.isEmpty(user.Q2Answer))
        throw new Error('Both security questions must have answers');

    user.Email = req.body.email;
    if (validator.isEmpty(user.Email) || !validator.isEmail(user.Email))
        throw new Error('Email address is not valid');

    user.Country = req.body.country;
    if (validator.isEmpty(user.Country) || !validator.isAlpha(user.Country))
        throw new Error('Country name is not valid');

    dbClient.Register(function (err)
    {
        if (err)
            next(err);
        else
            res.send("Client registered successfully!");
    }, user)
});

module.exports = router;
