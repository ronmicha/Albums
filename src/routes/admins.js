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
router.get('/allProducts', function (req, res, next)
{
    PromiseGetHandler(dbClient.AdminGetAllProducts(), req, res, next);
});

/**
 * @param - All albums's details. Sent in post body
 * All parameters are mandatory
 */
router.post('/addProduct', function (req, res, next)
{
    let name = req.body.name;
    let artist = req.body.artist;
    let genre = req.body.genre;
    let price = req.body.price;
    let date = req.body.dateReleased;
    let rating = req.body.rating;
    let amount = req.body.amount;

    ValidateAlbumDetails(name, artist, genre, price, date, rating, amount);

    dbClient.AdminAddGenre(genre);

    dbClient.AdminAddProduct(name, artist, genre, price, date, rating, amount).then(function ()
    {
        res.send('Album added successfully');

    }).catch(function (err)
    {
        next(err);
    });
});

/**
 * @param - all album's details, including ID. Sent in post body
 * Except album ID, none of the parameters are mandatory
 */
router.post('/updateProduct', function (req, res, next)
{
    let albumID = req.body.ID;
    if (!albumID)
        throw new Error('Album ID is required');
    let name = req.body.name ? "'" + req.body.name + "'" : "Name";
    let artist = req.body.artist ? "'" + req.body.artist + "'" : "Artist";
    let genre = req.body.genre ? "'" + req.body.genre + "'" : "Genre";
    let price = req.body.price ? req.body.price : "Price";
    let releaseDate = req.body.dateReleased ? "'" + req.body.dateReleased + "'" : "Date_Released";
    let rating = req.body.rating ? req.body.rating : "Rating";
    let amount = req.body.amount ? req.body.amount : "Amount_In_Stock";

    dbClient.AdminUpdateProduct(albumID, name, artist, genre, price, releaseDate, rating, amount).then(function ()
    {
        res.send('Album details updated successfully');
    }).catch(function (err)
    {
        next(err);
    });
});

/**
 * @param - Album ID. Sent in URL
 */
router.post('/deleteProduct', function (req, res, next)
{
    let albumID = req.query.albumID;
    if (!albumID)
        throw new Error('Album ID is required');
    dbClient.GetAlbumID(albumID).then(function (data)
    {
        if (!data || data.length === 0)
            throw new Error('Album {0} not exists!'.format(albumID));
        dbClient.AdminDeleteProduct(albumID).then(function ()
        {
            res.send('Album deleted successfully');
        }).catch(function (err)
        {
            next(err);
        })
    }).catch(function (error)
    {
        next(error);
    })

});

/**
 * @param - All client's details. Sent in post body
 */
router.post('/addClient', function (req, res, next)
{
    res.redirect('/register');
    res.clearCookie('AlbumShop');
});

/**
 * @param - Client's username. Sent in URL
 */
router.post('/deleteClient', function (req, res, next)
{
    let username = req.query.username;
    if (!username)
        throw new Error('Client username is required');
    dbClient.GetUser(username).then(function (data)
    {
        if (!data || data.length === 0)
            throw new Error('Client does not exist');

        dbClient.AdminDeleteClient(username).then(function ()
        {
            res.send('Client deleted successfully');
        }).catch(function (err)
        {
            next(err);
        })

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

function ValidateAlbumDetails(name, artist, genre, price, date, rating, amount)
{
    if (!name || validator.isEmpty(name))
        throw new Error('Album name is mandatory');
    if (!artist || validator.isEmpty(artist))
        throw new Error('Album artist is mandatory');
    if (!genre || validator.isEmpty(genre))
        throw new Error('Album genre is mandatory');
    if (!price || price < 0)
        throw new Error('Invalid or missing price');
    if (!date || validator.isAfter(date, new Date() + ''))
        throw new Error('Invalid Release Date');
    if (!rating || rating < 0 || rating > 5)
        throw new Error('Invalid Rating');
    if (!amount || amount < 0)
        throw new Error('Invalid Amount In Stock');
}
module.exports = router;
