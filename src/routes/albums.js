let express = require('express');
let bodyParser = require('body-parser');
let validator = require('validator');
let router = express.Router();
let dbClient = require('../DBClient');

router.use(bodyParser.json());

router.get('/hottest', function (req, res, next)
{
    PromiseGetHandler(dbClient.GetHottestAlbums(5), req, res, next);
});

router.get('/newest', function (req, res, next)
{
    PromiseGetHandler(dbClient.GetNewestAlbums(5), req, res, next);
});

router.get('/genres', function (req, res, next)
{
    PromiseGetHandler(dbClient.GetGenres(), req, res, next);
});

router.get('/albumsByGenre', function (req, res, next)
{
    let genre = req.query.genre;
    if (validator.isEmpty(genre))
        throw new Error('Genre can not be empty');
    PromiseGetHandler(dbClient.GetAlbumsByGenre(genre), req, res, next);
});

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