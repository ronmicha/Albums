let express = require('express');
let bodyParser = require('body-parser');
let validator = require('validator');
let router = express.Router();
let dbClient = require('../DBClient');
let cookieParser = require('cookie-parser');
router.use(cookieParser());

router.use(bodyParser.json());

/**
 * No parameters. Default # of albums = 5
 */
router.get('/hottest', function (req, res, next)
{
    PromiseGetHandler(dbClient.GetHottestAlbums(5), req, res, next);
});

/**
 * No parameters. Default # of albums = 5
 */
router.get('/newest', function (req, res, next)
{
    PromiseGetHandler(dbClient.GetNewestAlbums(5), req, res, next);
});

/**
 * No parameters
 */
router.get('/genres', function (req, res, next)
{
    PromiseGetHandler(dbClient.GetGenres(), req, res, next);
});

/**
 * @param - genre. Sent in URL
 */
// Todo: This middleware is shadowed by 'search' middleware. Remove?
router.get('/albumsByGenre', function (req, res, next)
{
    let genre = req.query.genre;
    if (validator.isEmpty(genre))
        throw new Error('Genre can not be empty');
    PromiseGetHandler(dbClient.GetAlbumsByGenre(genre), req, res, next);
});

/**
 * @param - album name, artist, genre, max price, min publish year, min rating.
 * Sent in URL.
 * None of the parameters is mandatory.
 */
router.get('/search', function (req, res, next)
{
    let name = req.query.name ? "'" + req.query.name + "'" : "Name";
    let artist = req.query.artist ? "'" + req.query.artist + "'" : "Artist";
    let genre = req.query.genre ? "'" + req.query.genre + "'" : "Genre";
    let maxPrice = req.query.maxPrice ? req.query.maxPrice : "Price";
    let year = req.query.year ? "'" + req.query.year + "-01-01'" : "Date_Released";
    let minRating = req.query.minRating ? req.query.minRating : "Rating";

    PromiseGetHandler(dbClient.SearchAlbums(name, artist, genre, maxPrice, year, minRating), req, res, next);
});

/**
 * @param - username. Sent in cookie
 */
router.get('/recommend', function (req, res, next)
{
    if (!req.cookies || !req.cookies['AlbumShop'])  // ToDo: Check cookies in albums router?
        throw new Error('Log in to get personal album recommendations');
    let username = req.cookies['AlbumShop'].login;
    PromiseGetHandler(dbClient.RecommendAlbums(username), req, res, next);
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