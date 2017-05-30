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

exports.GetHottestAlbums = function ()
{
    var connection = new Connection(config);
    connection.on('connect', function (err)
    {
        if (err)
            ReportError(err);

        Request = new Request("SELECT * From Albums", function (err, rowcount, rows)
        {
            console.log(rowcount + ' Returned');
        });

        Request.on('row', function (columns)
        {
            columns.forEach(function (column)
            {
                console.log("%s\t%s", column.metadata.colName, column.value);
            });
        });

        connection.execSql(Request);
    });
};

function ReportError(err)
{
    console.log(err);
    throw new Error(err);
}