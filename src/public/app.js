let app = angular.module('AlbumApp', ['ngRoute', 'LocalStorageModule']);

app.config(function (localStorageServiceProvider)
{
    localStorageServiceProvider.setPrefix('node_angular_App');
});

app.config(['$locationProvider', function ($locationProvider)
{
    $locationProvider.hashPrefix('');
}]);

app.config(['$routeProvider', function ($routeProvider)
{
    $routeProvider.when("/albums", {
        templateUrl: "views/Albums.html",
        controller: "testController"
    }).when("/users", {
        templateUrl: "views/Users.html",
        controller: 'testController'
    }).otherwise({
        redirect: '/'
    });
}]);
app.controller('testController', ['RestClient', function (RestClient)
{
    let vm = this;
    vm.name = 'Working!';
    RestClient.getSomething().then(function (data)
    {
        vm.genres = data;
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
            return Promise.resolve(response.data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };
    return service;
}]);