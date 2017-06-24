let app = angular.module('AlbumApp', ['ngRoute', 'LocalStorageModule']);

app.config(function (localStorageServiceProvider)
{
    localStorageServiceProvider.setPrefix('node_angular_App');
});

app.controller('testController', ['RestClient', function (RestClient)
{
    let vm = this;
    vm.name = 'Working!';
    RestClient.getSomething().then(function (data)
    {
        vm.hottest = data;
    }).catch(function (err)
    {
        vm.hottest = err;
    })
}]);

app.factory('RestClient', ['$http', function ($http)
{
    let service = {};
    service.getSomething = function ()
    {
        return $http.get('/albums/genres').then(function (response)
        {
            return new Promise(function (resolve, reject)
            {
                resolve(response.data);
            });
            // return Promise.resolve(response.data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };
    return service;
}]);