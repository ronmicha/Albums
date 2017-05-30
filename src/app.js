let express = require('express');
let app = express();

let users = require('./routes/users');
let albums = require('./routes/albums');
let admins = require('./routes/admins');

app.use('/users', users);
app.use('/albums', albums);
app.use('/admins', admins);

app.listen(3000, function ()
{
    console.log('Listening to port 3000...');
});