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
        res.redirect('/login');// ToDo what to do?

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
        res.send('Added Album Successfully');
    }).catch(function (err)
    {
        next(err);
    })
});

/**
 * @param - Shipping date * currency sent in post body as 'shippingDate' & 'currency'
 */
router.post('/purchaseCart', function (req, res, next)
{
    /* TODO:
     Add error handling in all promises somehow.
     Change all price to selected currency
     */
    let shippingDate = req.body.shippingDate;
    let currency = req.body.currency;
    let username = req.username;
    let orderID, cartData;

    // Check input:
    ValidateCartDetails(shippingDate, currency);
    // Get Cart data:
    dbClient.GetCartDetails(username).then(function (data)
    {
        cartData = data;
        // Check all items in cart are in stock:
        return CheckItemsInCartAreInStock(data, username, shippingDate, currency);
    }).then(dbClient.CreateOrder).then(function () // Create new order and get order ID
    {
        return dbClient.GetLatestOrderID(username);
    }).then(function (ordersIDs)
    {
        if (!ordersIDs || ordersIDs.length === 0)
            throw new Error('Error creating order');
        orderID = ordersIDs[0].OrderID;

        return dbClient.AddAlbumsOrdered(orderID, cartData);
    }).then(function ()
    {
        dbClient.ClearCart(username).then(function ()
        {
            res.send('Order {0} submitted successfully'.format(orderID));
        });
    }).catch(function (err)
    {
        next(err);
    });
});

function CheckItemsInCartAreInStock(data, username, shippingDate, currency)
{
    return new Promise(function (resolve, reject)
    {
        if (!data || data.length === 0)
            reject('User\'s cart is empty!');

        let totalPrice = 0;
        for (var i = 0; i < data.length; i++)
        {
            let record = data[i];
            if (record.OrderAmount > record.AmountInStock)
                reject("Can't order {0} copies of album {1}. Currently in stock: {2}".format(
                    record.OrderAmount, record.AlbumName, record.AmountInStock));
            totalPrice += record.Price;
        }
        let orderData = {};
        orderData.Username = username;
        orderData.OrderDate = new Date();
        orderData.TotalPrice = totalPrice;
        orderData.ShippingDate = shippingDate;
        orderData.Currency = currency;
        resolve(orderData);
    });
}

function ValidateCartDetails(shippingDate, currency)
{
    if (!currency || (currency !== 'NIS' && currency !== 'USD' ))
        throw new Error('Currency must be NIS or USD');

    // Set minimum order date to one week:
    let minimumOrder = new Date();
    minimumOrder.setDate(minimumOrder.getDate() + 6);
    if (validator.isEmpty(shippingDate) || !validator.isAfter(shippingDate + '', minimumOrder + ''))
        throw new Error('Shipping date must be at least one week from today');
}

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
