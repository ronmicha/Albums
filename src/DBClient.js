var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

// Create connection to database
var config = {
    userName: 'shwiloo',
    password: 'RonShaq123',
    server: 'as-server.database.windows.net',
    options: {
        database: 'AlbumShop',
        encrypt: true
    }
};

exports.GetHottestAlbums = function (numOfAlbums, callback)
{
    let query = "SELECT TOP " + numOfAlbums + " * " +
        "FROM Albums A INNER JOIN Orders ";
    Get(query, callback);
};

exports.GetGenres = function (callback)
{
    let query = "SELECT Name AS GenreName FROM Genres";
    Get(query, callback);
};

exports.GetAlbumsByGenre = function (genre, callback)
{
    let query = "SELECT A.Name, A.Artist, G.Name AS Genre, A.Price, A.Date_Released, A.Rating" +
        " FROM Albums A Join Genres G ON A.Genre = G.ID WHERE G.Name = '{0}'".format(genre);
    Get(query, callback);
};

exports.Register = function (callback, user)
{
    let username = user.Username;
    let password = user.Password;
    let q1_a = user.Q1Answer;
    let q2_a = user.Q2Answer;
    let email = user.Email;
    let country = user.Country;
    let query = "INSERT INTO Clients VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}')".format(username, password, q1_a, q2_a, email, country);
    Post(query, callback);
};

function Get(query, callback)
{
    let connection = new Connection(config);
    let data = [];

    connection.on('connect', function (err)
    {
        if (err)
        {
            callback(err);
            return;
        }

        let request = new Request(query, function (err)
        {
            if (err)
                callback(err);
            else
                callback(null, data);
        });

        request.on('row', function (columns)
        {
            let row = {};
            columns.forEach(function (column)
            {
                row[column.metadata.colName] = column.value;
            });
            data.push(row);
        });

        connection.execSql(request);
    });
}

function Post(query, callback)
{
    let connection = new Connection(config);

    connection.on('connect', function (err)
    {
        if (err)
        {
            callback(err);
            return;
        }

        let request = new Request(query, function (err)
        {
            if (err)
                callback(err);
            else
                callback(null);
        });

        connection.execSql(request);
    });
}


//region General functionalities
if (!String.prototype.format)
{
    String.prototype.format = function ()
    {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number)
        {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}
//endregion