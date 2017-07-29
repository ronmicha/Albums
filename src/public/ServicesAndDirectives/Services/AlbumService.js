angular.module('AlbumApp').factory('AlbumsService', ['$http', function ($http)
{
    let service = {};
    let url = '/api/albums';
    service.getGenres = function ()
    {
        return $http.get(url + '/genres', '').then(function (response)
        {
            let genres = response.data.map(function (g)
            {
                return g.Name;
            });
            return Promise.resolve(genres);
        }).catch(function (err)
        {
            return Promise.reject(err);
        });
    };
    service.getHottest = function ()
    {
        return $http.get(url + '/hottest').then(function (data)
        {
            return Promise.resolve(data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        });
    };
    service.getNewest = function ()
    {
        return $http.get(url + '/newest').then(function (data)
        {
            return Promise.resolve(data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        });
    };

    service.getAllAlbums = function ()
    {
        return $http.get(url + '/search').then(function (data)
        {
            return Promise.resolve(data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };
    return service
}]);