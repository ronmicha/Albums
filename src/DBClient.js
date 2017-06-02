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
        ("SELECT Name, Artist, Genre, Price, Convert(varchar(10), Date_Released, 120) AS [Date Released], Rating " +
        "FROM Albums " +
        "WHERE ID IN ({0})").format(subQuery);
    return Read(query);
};

exports.GetNewestAlbums = function (numOfAlbums)
{
    let query =
        ("SELECT TOP {0} Name, Artist, Genre, Price, Convert(varchar(10), Date_Released, 120) AS [Date Released], Rating " +
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
        ("SELECT A.Name, A.Artist, A.Genre, A.Price, Convert(varchar(10), A.Date_Released, 120) AS [Date Released], A.Rating " +
        "FROM Albums A JOIN Genres G ON A.Genre = G.Name " +
        "WHERE G.Name = '{0}'").format(genre);
    return Read(query);
};

exports.SearchAlbums = function (name, artist, genre, maxPrice, year, minRating)
{
    let query =
        "SELECT Name, Artist, Genre, Price, Convert(varchar(10), Date_Released, 120) AS [Date Released], Rating " +
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
        "VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}'); ").format(username, password, q1_a, q2_a, email, country);
    if (user.FavGenres.length > 0)
    {
        query +=
            ("INSERT INTO ClientsFavGenres " +
            "VALUES ('{0}', '{1}')").format(user.Username, user.FavGenres[0]);
        for (let i = 1; i < user.FavGenres.length; i++)
            query += " ,('{0}', '{1}')".format(user.Username, user.FavGenres[i]);
    }
    return Write(query);
};

exports.GetUser = function (username)
{
    let query =
        ("SELECT TOP 1 * " +
        "FROM Clients " +
        "WHERE Username = '{0}'").format(username);
    return Read(query);
};

exports.GetPreviousOrders = function (username)
{
    let query =
        ("SELECT Order_Date AS [Date], Total_Price AS [Total], Shipping_Date AS [Shipping Date], Currency " +
        "FROM Orders " +
        "WHERE username = '{0}'").format(username);
    return Read(query);
};

exports.AddAlbumToCart = function (username, albumID)
{
    let query =
        ("INSERT INTO ClientsCarts (Username, AlbumID) " +
        "VALUES ('{0}', {1})").format(username, albumID);
    return Write(query);
};

exports.GetCartDetails = function (username)
{
    let query =
        ("SELECT C.Username as Username, C.AlbumID as AlbumID, A.Name AS AlbumName, C.Amount as OrderAmount," +
        " A.Price as Price, A.Amount_In_Stock as AmountInStock " +
        "FROM Albums A INNER JOIN ClientsCarts C ON A.ID = C.AlbumID " +
        "WHERE C.Username= '{0}'").format(username);
    return Read(query);
};

exports.CreateOrder = function (username, orderDate, totalPrice, shippingDate, currency)
{
    orderDate = orderDate.getFullYear() + '-' + (orderDate.getMonth() + 1) + '-' + orderDate.getDate();
    let query =
        ("INSERT INTO Orders(Username, Order_Date, Total_Price, Shipping_Date,Currency) " +
        "Values('{0}', '{1}', {2}, '{3}', '{4}')").format(
            username, orderDate, totalPrice, shippingDate, currency);
    return Write(query);
};

exports.GetLatestOrderID = function (username)
{
    let query =
        "Select MAX(ID) AS OrderID FROM Orders WHERE Username = '{0}'".format(username);
    return Read(query);
};

exports.AddAlbumsOrdered = function (orderID, data)
{
    let query =
        "INSERT INTO AlbumsOrdered (Order_ID, Username, Album_ID) Values ";
    var i;
    for (i = 0; i < data.length - 1; i++)
    {
        let albumID = data[i].AlbumID;
        let username = data[i].Username;
        query += "({0}, {1}, '{2}'),".format(orderID, username, albumID);
    }
    let albumID = data[i].AlbumID;
    let username = data[i].Username;
    query += "({0}, '{1}', '{2}');".format(orderID, username, albumID);
    return Write(query);
};

exports.ClearCart = function (username)
{
    let query =
        "DELETE FROM ClientsCarts WHERE Username = '{0}'".format(username);
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