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
    {
        req.username = cookie.login;
        next();
    }
    else
    // ToDo what to do?
        res.redirect('/login');
});

router.get('/previousOrders', function (req, res, next)
{
    let username = req.username;
    PromiseGetHandler(dbClient.GetPreviousOrders(username), req, res, next);
});

function PromiseGetHandler(promise, req, res, next)
{
    promise.then(function (data)
    {
        res.send(data);
    }).catch(function (err)
    {
        next(err);
    })
}
module.exports = router;
