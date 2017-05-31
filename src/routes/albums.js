let express = require('express');
let router = express.Router();
let dbClient = require('../DBClient');

router.get('/hottest', function (req, res, next)
{
    dbClient.GetHottestAlbums(function (err, data)
    {
        if (err)
            next(err);
        else
            res.send(data);
    })
});

module.exports = router;
