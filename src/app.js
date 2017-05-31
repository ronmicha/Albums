let express = require('express');
let app = express();

let users = require('./routes/users');
let albums = require('./routes/albums');
let admins = require('./routes/admins');
let dbClient = require('./DBClient');

app.use('/users', users);
app.use('/albums', albums);
app.use('/admins', admins);

app.get('/', function (req, res)
{
    dbClient.GetHottestAlbums(function (err, data)
    {
        if (err)
            console.log(err);
        else
            res.send(data);
    });
});

app.listen(3000, function ()
{
    console.log('Listening to port 3000...');
});