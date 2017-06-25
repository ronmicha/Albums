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

app.use(express.static(__dirname + '/public'));

//region User Login & Register
let dbClient = require('./DBClient');
let validator = require('validator');
let cookieParser = require('cookie-parser');
app.use(cookieParser());

/**
 * Parameters in body:
 * username, password, q1answer, q2answer, email, country - mandatory
 * favGenres - optional
 */
app.post('/register', function (req, res, next)
{
    module.exports.Register(req, res, next);
});

/**
 * Parameters in body: username, password - mandatory
 */
app.post('/login', function (req, res, next)
{
    let cookie = req.cookies['AlbumShop'];
    if (cookie && cookie.login.hashCode() === cookie.key)
    {
        // alert('');
        // res.send('Logged in successfully');
        dbClient.GetUser(cookie.login).then(function (users)
        {
            res.send(users[0]);
        }).catch(function (err)
        {
            next(err);
        });
        return;
    }

    let username = req.body.username;
    let password = req.body.password;
    if (!username || !password)
        throw new Error('Please enter username and password');

    let promise = dbClient.GetUser(username);
    if (!promise)
        throw new Error('Problem logging in');
    promise.then(function (users)
    {
        if (!users || users.length === 0)
            throw new Error('Username not found');
        if (users[0].Password !== password)
            throw new Error('Password incorrect');

        CreateCookie(res, users[0]);
        res.send(users[0]);
    }).catch(function (err)
    {
        next(err);
    })
});

/**
 * Parameters in body: username, q1answer, q2answer - mandatory
 */
app.post('/passwordRecover', function (req, res, next)
{
    let username = req.body.username;
    let q1ans = req.body.q1answer;
    let q2ans = req.body.q2answer;
    if (!username || !q1ans || !q2ans)
        throw new Error('Missing data. Username and 2 answers are required');

    dbClient.GetAnswers(username).then(function (data)
    {
        if (!data || data.length === 0)
            throw new Error('User not found!');
        data = data[0];
        let q1ansFromDB = data.Q1Answer;
        let q2ansFromDB = data.Q2Answer;
        if (q1ansFromDB === q1ans && q2ansFromDB === q2ans)
            res.send("Welcome, {0}. Your password is: {1}".format(username, data.Password));
        else
            throw new Error('Incorrect answers!');

    }).catch(function (err)
    {
        next(err);
    })
});

app.get('/checkUsernameAvailable', function (req, res, next)
{
    let name = req.query.name;
    dbClient.GetUser(name).then(function (data)
    {
        if (data.length === 0)
            res.send({exists: false});
        else
            res.send({exists: true})
    }).catch(function (err)
    {
        next(err);
    })
});

function CreateCookie(res, user)
{
    let today = new Date();
    let date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    res.cookie('AlbumShop', {login: user.Username, key: user.Username.hashCode(), lastLogin: date});
}

String.prototype.hashCode = function ()
{
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++)
    {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

exports.Register = function (req, res, next)
{
    let user = {};
    user.Username = req.body.username.toLowerCase();
    user.Password = req.body.password;
    user.Q1Answer = req.body.q1answer;
    user.Q2Answer = req.body.q2answer;
    user.Email = req.body.email;
    user.Country = req.body.country;
    user.FavGenres = req.body.favGenres;

    ValidateUserDetails(user);

    dbClient.Register(user).then(function ()
    {
        if (!req.cookies['AlbumShop'])
            CreateCookie(res, user);
        res.send('Client added successfully');
    }).catch(function (err)
    {
        next(err);
    })
};

function ValidateUserDetails(user)
{
    if (!user.Username || validator.isEmpty(user.Username) || !validator.isAlpha(user.Username)
        || !validator.isLength(user.Username, {min: 3, max: 8}))
        throw new Error('Username must be 3-8 characters long containing english letters only');

    if (!user.Password || validator.isEmpty(user.Password) || !validator.isAlphanumeric(user.Password)
        || !validator.isLength(user.Password, {min: 5, max: 10}))
        throw new Error('Password must be 5-10 characters long containing english letters or numbers only');

    if (!user.Q1Answer || validator.isEmpty(user.Q1Answer) || !user.Q2Answer || validator.isEmpty(user.Q2Answer))
        throw new Error('Both security questions must have answers');

    if (!user.Email || validator.isEmpty(user.Email) || !validator.isEmail(user.Email))
        throw new Error('Email address is not valid');

    if (!user.Country || validator.isEmpty(user.Country) || !validator.isAlpha(user.Country))
        throw new Error('Country name is not valid');
}
//endregion

// Handle invalid path:
app.use(function (req, res, next)
{
    console.log('ERROR: Invalid path: ' + req.originalUrl);
    res.status(404).send('404: Page Not Found');
});

// Handle errors:
app.use(function (err, req, res, next)
{
    console.log(err);
    res.status(418).send('ERROR: ' + err.message);
});