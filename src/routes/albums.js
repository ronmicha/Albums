let express = require('express');
let bodyParser = require('body-parser');
let validator = require('validator');
let router = express.Router();
let dbClient = require('../DBClient');

router.use(bodyParser.json());

router.get('/hottest', function (req, res, next)
{
    dbClient.GetHottestAlbums(5, function (err, data)
    {
        if (err)
            next(err);
        else
            res.send(data);
    })
});

router.get('/genres', function (req, res, next)
{
    dbClient.GetGenres(function (err, data)
    {
        if (err)
            next(err);
        else
            res.send(data);
    })
});

router.get('/albumsByGenre', function (req, res, next)
{
    let genre = req.query.genre;
    if (validator.isEmpty(genre))
        throw new Error('Genre can not be empty');
    dbClient.GetAlbumsByGenre(genre, function (err, data)
    {
        if (err)
            next(err);
        else
            res.send(data);
    })
});


module.exports = router;
