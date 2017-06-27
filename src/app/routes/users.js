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
        throw new Error('This action is available for logged-in users only');

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
    dbClient.GetAlbumID(albumID).then(function (data)
    {
        if (!data || data.length === 0)
            throw new Error('Album ID {0} not exist'.format(albumID));

        dbClient.AddAlbumToCart(username, albumID).then(function ()
        {
            res.send('Album added successfully');
        }).catch(function (err)
        {
            next(err);
        })
    }).catch(function (err)
    {
        next(err);
    });

});

/**
 * @param AlbumId - sent in post parameters
 */
router.post('/removeAlbumFromCart', function (req, res, next)
{
    let username = req.username;
    let albumID = req.query.albumID;
    if (!albumID)
        throw new Error('Album ID is required');
    dbClient.RemoveAlbumFromCart(username, albumID).then(function ()
    {
        res.send('Album removed successfully');
    }).catch(function (err)
    {
        next(err);
    })
});

/**
 * @param - Shipping date & currency sent in post body as 'shippingDate' & 'currency'
 */
router.post('/purchaseCart', function (req, res, next)
{
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
        //Create new order:
    }).then(dbClient.CreateOrder).then(function ()
    {
        // Get order ID:
        return dbClient.GetLatestOrderID(username);
    }).then(function (ordersIDs)
    {
        if (!ordersIDs || ordersIDs.length === 0)
            throw new Error('We had a problem submitting your order. Please try again');
        orderID = ordersIDs[0].OrderID;
        // Add to AlbumsOrdered and update inventory:
        return dbClient.AddAlbumsOrderedAndUpdateInventory(orderID, cartData);
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

/**
 * @param - username. Sent in cookie
 */
router.get('/recommend', function (req, res, next)
{
    let username = req.cookies['AlbumShop'].login;
    PromiseGetHandler(dbClient.RecommendAlbums(username), req, res, next);
});

function CheckItemsInCartAreInStock(data, username, shippingDate, currency)
{
    return new Promise(function (resolve, reject)
    {
        if (!data || data.length === 0)
            reject(new Error("Your cart is empty"));

        let totalPrice = 0;
        for (var i = 0; i < data.length; i++)
        {
            let record = data[i];
            if (record.OrderAmount > record.AmountInStock)
                reject(new Error("Can't order {0} copies of album {1}. Currently in stock: {2}".format(
                    record.OrderAmount, record.AlbumName, record.AmountInStock)));
            let priceInCurrency = record.Price;
            if (currency === 'USD')
                priceInCurrency *= 0.281962;
            totalPrice += priceInCurrency * record.OrderAmount;
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
    if (!currency || (currency !== 'NIS' && currency !== 'USD'))
        throw new Error('Currency may be NIS or USD only');

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
