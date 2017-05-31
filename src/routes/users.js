let express = require('express');
let dbClient = require('../DBClient');
let router = express.Router();

router.get('/', function (req, res, next)
{

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
    dbClient.Register(function (err)
    {
        if (err)
            next(err);
        else
            res.send("Client registered successfully!");
    }, user)
});

module.exports = router;
