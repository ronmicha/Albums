let express = require('express');
let bodyParser = require('body-parser');
let router = express.Router();
let dbClient = require('../DBClient');

router.use(bodyParser.json());

router.get('/hottest', function (req, res, next)
{
    dbClient.GetHottestAlbums(function (err, data)
    {
        if (err)
            next(err);
        else
            res.send(data);
    }, 5)
});

module.exports = router;
