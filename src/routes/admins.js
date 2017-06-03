let express = require('express');
let router = express.Router();
let dbClient = require('../DBClient');
let cookieParser = require('cookie-parser');
router.use(cookieParser());

router.use(function (req, res, next)
{
    let cookie = req.cookies['AlbumShop'];
    if (!cookie || !cookie.login.hashCode() === cookie.key)
        throw new Error('This action is available for system admins only');

    let username = cookie.login;
    dbClient.GetAdmin(username).then(function (data)
    {
        if (!data || data.length === 0)
            throw new Error('This action is available for system admins only');

        // Update last login to today:
        let today = new Date();
        let date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
        res.cookie('AlbumShop', {login: cookie.login, key: cookie.key, lastLogin: date});
        req.username = cookie.login;
        next();

    }).catch(function (err)
    {
        next(err);
    });
});

/**
 * No parameters
 */
router.get('/allOrders', function (req, res, next)
{
    PromiseGetHandler(dbClient.AdminGetAllOrders(), req, res, next);
});

/**
 * No parameters
 */
router.get('allProducts', function (req, res, next)
{
    PromiseGetHandler(dbClient.AdminGetAllProducts, req, res, next);
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
