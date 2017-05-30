var Connection = require('tedious').Connection;
var Request = require('tedious').Request;


// Create connection to database
var config = {
    userName: 'shwiloo',
    password: 'RonShaq123',
    server: 'as-server.database.windows.net',
    options: {
        database: 'AlbumShop'
    }
};

var connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on('connect', function(err) {
    if (err) {
        console.log(err)
    }
    else{
        insertIntoDatabase()
    }
});