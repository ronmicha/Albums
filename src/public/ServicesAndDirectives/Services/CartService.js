angular.module('AlbumApp').factory('CartService', ['$http', function ($http)
{
    let service = {};
    let url = '/api/users';
    service.getCart = function (username)
    {
        return $http.get(url + '/getCart', username).then(function (data)
        {
            return Promise.resolve(data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };
    service.addAlbumToCart = function (albumID, amount)
    {
        return $http({
            url: url + '/addAlbumToCart',
            method: 'POST',
            params: {albumID: albumID, amount: amount}
        }).then(function ()
        {
            return Promise.resolve();
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };
    service.removeFromCart = function (albumID, amount)
    {
        return $http({
            url: url + '/removeAlbumFromCart',
            method: 'POST',
            params: {albumID: albumID, amount: amount}
        }).then(function ()
        {
            return Promise.resolve();
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };
    return service;
}]);