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

exports.GetHottestAlbums = function (numOfAlbums)
{
    let query = "SELECT TOP " + numOfAlbums + " * " +
        "FROM Albums A INNER JOIN Orders ";
    return Read(query);
};

exports.GetGenres = function ()
{
    let query = "SELECT Name AS GenreName FROM Genres";
    return Read(query);
};

exports.GetAlbumsByGenre = function (genre)
{
    let query = "SELECT A.Name, A.Artist, G.Name AS Genre, A.Price, A.Date_Released, A.Rating" +
        " FROM Albums A Join Genres G ON A.Genre = G.ID WHERE G.Name = '{0}'".format(genre);
    return Read(query);
};

exports.Register = function (user)
{
    let username = user.Username;
    let password = user.Password;
    let q1_a = user.Q1Answer;
    let q2_a = user.Q2Answer;
    let email = user.Email;
    let country = user.Country;
    let query = "INSERT INTO Clients VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}')".format(username, password, q1_a, q2_a, email, country);
    return Write(query);
};

function Read(query)
{
    return new Promise(function (resolve, reject)
    {
        let connection = new Connection(config);
        let data = [];

        connection.on('connect', function (err)
        {
            if (err)
            {
                reject(err);
                return;
            }

            let request = new Request(query, function (err)
            {
                if (err)
                    reject(err);
                else
                    resolve(data);
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

    });
}

function Write(query)
{
    return new Promise(function (resolve, reject)
    {
        let connection = new Connection(config);

        connection.on('connect', function (err)
        {
            if (err)
                reject(err);

            let request = new Request(query, function (err)
            {
                if (err)
                    reject(err);
                else
                    resolve();
            });

            connection.execSql(request);
        });
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