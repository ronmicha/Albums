let express = require('express');
let bodyParser = require('body-parser');
let app = express();

let users = require('./routes/users');
let albums = require('./routes/albums');
let admins = require('./routes/admins');

app.use(bodyParser.json());
app.use('/users', users);
app.use('/albums', albums);
app.use('/admins', admins);

app.listen(3000, function ()
{
    console.log('Listening to port 3000...');
});

app.use(function (err, req, res, next)
{
    console.log(err);
    res.status(418).send('ERROR: ' + err.message);
});