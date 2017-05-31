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

exports.GetHottestAlbums = function (callback)
{
    let query = "SELECT * FROM Albums";
    Get(query, callback);
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

        let request = new Request(query, function (err, rowcount)
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