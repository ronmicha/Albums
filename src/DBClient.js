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

//region Albums Functions
exports.GetHottestAlbums = function (numOfAlbums)
{
    let subQuery =
        ("SELECT TOP {0} A.ID " +
        "FROM AlbumsOrdered AO JOIN Orders O ON AO.Order_ID = O.ID " +
        "JOIN Albums A ON AO.Album_ID = A.ID " +
        "WHERE O.Order_Date >= DATEADD(day, -7, GETDATE()) " +
        "GROUP BY A.ID " +
        "ORDER BY COUNT(A.ID) DESC").format(numOfAlbums);
    let query =
        ("SELECT Name, Artist, Genre, Price, Date_Released, Rating " +
        "FROM Albums " +
        "WHERE ID IN ({0})").format(subQuery);
    return Read(query);
};

exports.GetNewestAlbums = function (numOfAlbums)
{
    let query =
        ("SELECT TOP {0} Name, Artist, Genre, Price, Date_Released, Rating " +
        "FROM Albums " +
        "WHERE Date_Released >= DATEADD(month, -1, GETDATE()) " +
        "ORDER BY Date_Released DESC").format(numOfAlbums);
    return Read(query);
};

exports.GetGenres = function ()
{
    let query =
        "SELECT Name " +
        "FROM Genres " +
        "ORDER BY Name DESC";
    return Read(query);
};

exports.GetAlbumsByGenre = function (genre)
{
    let query =
        ("SELECT A.Name, A.Artist, A.Genre, A.Price, A.Date_Released, A.Rating " +
        "FROM Albums A JOIN Genres G ON A.Genre = G.Name " +
        "WHERE G.Name = '{0}'").format(genre);
    return Read(query);
};

exports.SearchAlbums = function (name, artist, genre, maxPrice, year, minRating)
{
    let query =
        "SELECT Name, Artist, Genre, Price, Convert(varchar(10), Date_Released, 120) AS Date_Released, Rating " +
        "FROM Albums " +
        "WHERE Name = {0} AND Artist = {1} AND Genre = {2} AND Price <= {3} AND Date_Released >= {4} AND Rating >= {5}".format(name, artist, genre, maxPrice, year, minRating);
    return Read(query);
};
//endregion

exports.Register = function (user)
{
    let username = user.Username;
    let password = user.Password;
    let q1_a = user.Q1Answer;
    let q2_a = user.Q2Answer;
    let email = user.Email;
    let country = user.Country;
    let query =
        ("INSERT INTO Clients " +
        "VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}')").format(username, password, q1_a, q2_a, email, country);
    return Write(query);
};

exports.GetUser = function (username)
{
    let query =
        ("SELECT * " +
        "FROM Clients " +
        "WHERE Username = '{0}'").format(username);
    return Read(query);
};

exports.GetPreviousOrders = function (username)
{
    let query =
        ("SELECT Order_Date AS Date, Total_Price AS Total," +
        " Shipping_Date AS 'Shipping Date', Currency From Orders Where username = '{0}'").format(username);
    return Read(query);
};

exports.AddAlbumToCart = function (username, albumID)
{
    let query =
        ("INSERT INTO ClientsCarts (Username,AlbumID) VALUES ('{0}',{1})").format(username, albumID);
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

//region General Functionalities
if (!String.prototype.format)
{
    String.prototype.format = function ()
    {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number)
        {
            return typeof args[number] !== 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}
//endregion