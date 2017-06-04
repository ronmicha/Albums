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
    let lastWeekTopSellerAlbums =
        ("SELECT TOP {0} A.ID " +
        "FROM AlbumsOrdered AO JOIN Orders O ON AO.Order_ID = O.ID " +
        "JOIN Albums A ON AO.Album_ID = A.ID " +
        "WHERE O.Order_Date >= DATEADD(day, -7, GETDATE()) " +
        "GROUP BY A.ID " +
        "ORDER BY SUM(AO.Amount) DESC").format(numOfAlbums);
    let query =
        ("SELECT Name, Artist, Genre, Price, Convert(varchar(10), Date_Released, 120) AS [Date Released], Rating " +
        "FROM Albums " +
        "WHERE ID IN ({0})").format(lastWeekTopSellerAlbums);
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

// Recommendation: Other purchased albums of users who purchased the same albums the user did
exports.RecommendAlbums = function (username)
{
    let albumsUserOrdered =
        ("SELECT DISTINCT Album_ID " +
        "FROM AlbumsOrdered " +
        "WHERE Username = '{0}'").format(username);
    let usersOrderedSameAlbums =
        ("SELECT DISTINCT Username " +
        "FROM AlbumsOrdered " +
        "WHERE Album_ID IN ({0}) AND Username <> '{1}'").format(albumsUserOrdered, username);
    let recommendedAlbumsIDs =
        ("SELECT DISTINCT Album_ID " +
        "FROM AlbumsOrdered " +
        "WHERE Album_ID NOT IN ({0}) AND Username IN ({1})").format(albumsUserOrdered, usersOrderedSameAlbums);
    let query =
        ("SELECT Name, Artist, Genre, Price, Convert(varchar(10), Date_Released, 120) AS [Date Released], Rating " +
        "FROM Albums " +
        "WHERE ID IN ({0})").format(recommendedAlbumsIDs);
    return Read(query);
};
//endregion

//region Users Functions
exports.GetAnswers = function (username)
{
    let query =
        ("SELECT TOP 1 Q1_Answer AS Q1Answer, Q2_Answer AS Q2Answer, Password " +
        "FROM Clients WHERE Username = '{0}'").format(username);
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
        ("UPDATE ClientsCarts " +
        "SET Amount = Amount + 1 " +
        "WHERE Username = '{0}' AND AlbumID = {1} " +
        "IF @@ROWCOUNT = 0 " +
        "INSERT INTO ClientsCarts " +
        "VALUES ('{0}', {1}, 1)").format(username, albumID);
    return Write(query);
};

exports.RemoveAlbumFromCart = function (username, albumID)
{
    let query =
        ("UPDATE ClientsCarts " +
        "SET Amount = Amount - 1 " +
        "WHERE Username = '{0}' AND AlbumID = {1}; ").format(username, albumID);
    query +=
        "DELETE FROM ClientsCarts " +
        "WHERE Amount = 0";
    return Write(query);
};

exports.GetCartDetails = function (username)
{
    let query =
        ("SELECT C.Username as Username, C.AlbumID as AlbumID, A.Name AS AlbumName, C.Amount as OrderAmount," +
        " A.Price as Price, A.Amount_In_Stock as AmountInStock " +
        "FROM Albums A INNER JOIN ClientsCarts C ON A.ID = C.AlbumID " +
        "WHERE C.Username = '{0}'").format(username);
    return Read(query);
};

exports.CreateOrder = function (orderData)
{
    let username = orderData.Username;
    let orderDate = orderData.OrderDate;
    orderDate = orderDate.getFullYear() + '-' + (orderDate.getMonth() + 1) + '-' + orderDate.getDate();
    let totalPrice = orderData.TotalPrice;
    let shippingDate = orderData.ShippingDate;
    let currency = orderData.Currency;
    let query =
        ("INSERT INTO Orders(Username, Order_Date, Total_Price, Shipping_Date, Currency) " +
        "VALUES('{0}', '{1}', {2}, '{3}', '{4}')").format(
            username, orderDate, totalPrice, shippingDate, currency);
    return Write(query);
};

exports.GetLatestOrderID = function (username)
{
    let query =
        ("Select MAX(ID) AS OrderID " +
        "FROM Orders " +
        "WHERE Username = '{0}'").format(username);
    return Read(query);
};

exports.AddAlbumsOrderedAndUpdateInventory = function (orderID, data)
{
    let UpdateQuery =
        "UPDATE Albums SET Amount_In_Stock = CASE ID ";
    let OrderQuery =
        "INSERT INTO AlbumsOrdered (Order_ID, Username, Album_ID, Amount) VALUES ";
    var i;
    for (i = 0; i < data.length - 1; i++)
    {
        let albumID = data[i].AlbumID;
        let username = data[i].Username;
        let amount = data[i].OrderAmount;
        OrderQuery += "({0}, '{1}', {2}, {3}),".format(orderID, username, albumID, amount);
        UpdateQuery += "WHEN {0} THEN (Amount_In_Stock - {1}) ".format(albumID, amount);
    }
    let albumID = data[i].AlbumID;
    let username = data[i].Username;
    let amount = data[i].OrderAmount;
    OrderQuery += "({0}, '{1}', {2}, {3});".format(orderID, username, albumID, amount);
    UpdateQuery += "WHEN {0} THEN (Amount_In_Stock - {1}) ELSE Amount_In_Stock END".format(albumID, amount);
    Write(OrderQuery).then(function ()
    {
        return Write(UpdateQuery);
    });
};

exports.ClearCart = function (username)
{
    let query =
        ("DELETE FROM ClientsCarts " +
        "WHERE Username = '{0}'").format(username);
    return Write(query);
};
//endregion

//region Admins Functions
exports.GetAdmin = function (username)
{
    let query =
        ("SELECT TOP 1 * " +
        "FROM Admins " +
        "WHERE Username = '{0}'").format(username);
    return Read(query);
};

/**
 * Delete album from albums table only, not from ClientsCarts or AlbumsOrdered
 */
exports.AdminDeleteProduct = function (albumID)
{
    let query =
        ("DELETE FROM Albums " +
        "WHERE ID = {0}").format(albumID);
    return Write(query);
};

exports.AdminUpdateProduct = function (albumID, name, artist, genre, price, releaseDate, rating, amount)
{
    let query =
        ("UPDATE Albums " +
        "SET Name = {0}, Artist = {1}, Genre = {2}, Price = {3}, Date_Released = {4}, Rating = {5}, Amount_In_Stock = {6} " +
        "WHERE ID = {7}").format(name, artist, genre, price, releaseDate, rating, amount, albumID);
    return Write(query);
};

exports.AdminGetAllOrders = function ()
{
    let query =
        "SELECT ID, Username, Order_Date AS OrderDate, Total_Price AS TotalPrice, Shipping_Date " +
        "As ShippingDate, Currency FROM Orders";
    return Read(query);
};

exports.AdminGetAllProducts = function ()
{
    let query =
        "SELECT * FROM Albums";
    return Read(query);
};

exports.AdminAddProduct = function (name, artist, genre, price, date, rating, amount)
{
    let query =
        ("INSERT INTO Albums(Name, Artist, Genre, Price, Date_Released, Rating, Amount_In_Stock) " +
        "VALUES ('{0}', '{1}', '{2}', {3}, '{4}', {5}, {6})").format(name, artist, genre, price, date, rating, amount);
    return Write(query);
};

exports.AdminDeleteClient = function (username)
{
    let query =
        ("DELETE FROM Clients WHERE Username = '{0}'; " +
        "DELETE FROM Admins WHERE Username = '{0}'; " +
        "DELETE FROM ClientsCarts WHERE Username = '{0}'; " +
        "DELETE FROM ClientsFavGenres WHERE Username = '{0}';").format(username);
    return Write(query);
};

exports.AdminAddGenre = function (genre)
{
    let query =
        ("BEGIN IF NOT EXISTS (SELECT * FROM Genres WHERE Name = '{0}') " +
        "BEGIN INSERT INTO Genres (Name) VALUES ('{0}') END END").format(genre);
    return Write(query);
};
//endregion

//region General Functionalities
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