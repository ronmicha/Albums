let express = require('express');
let router = express.Router();
let dbClient = require('../DBClient');
let validator = require('validator');
let cookieParser = require('cookie-parser');
router.use(cookieParser());

router.use(function (req, res, next)
{
    let cookie = req.cookies['AlbumShop'];
    if (!cookie || !cookie.login.hashCode() === cookie.key)
        res.redirect('/login');// ToDo: What to do?

    // Update last login to today:
    let today = new Date();
    let date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    res.cookie('AlbumShop', {login: cookie.login, key: cookie.key, lastLogin: date});
    req.username = cookie.login;
    next();

});

/**
 * No Parameters
 * */
router.get('/previousOrders', function (req, res, next)
{
    let username = req.username;
    PromiseGetHandler(dbClient.GetPreviousOrders(username), req, res, next);
});

/**
 * @param AlbumId - sent in post parameters
 */
router.post('/addAlbumToCart', function (req, res, next)
{
    let username = req.username;
    let albumID = req.query.albumID;
    if (!albumID)
        throw new Error('Album ID is required');
    dbClient.AddAlbumToCart(username, albumID).then(function ()
    {
        res.send('Album added successfully');
    }).catch(function (err)
    {
        next(err);
    })
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
