angular.module('AlbumApp').factory('DataSource', ['$http', function ($http)
{
    return {
        get: function (file, callback, transform)
        {
            $http.get(file, {transformResponse: transform}).then(function (data)
            {
                callback(data);
            }).catch(function (err)
            {
            });

        }
    };
}]);