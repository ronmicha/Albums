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
        controller: "albumsController"
    }).when("/login", {
        templateUrl: "views/Login.html",
        controller: "loginController"
    }).when("/signup", {
        templateUrl: "views/Signup.html",
        controller: "signupController"
    }).when("/cart", {
        templateUrl: "views/Cart.html",
        controller: "cartController"
    }).otherwise({
        redirect: '/'
    });
}]);

//region Controllers
app.controller('mainPageController', ['UserService', '$scope', function (UserService, $scope)
{
    let vm = this;
    vm.isLoggedIn = UserService.isLoggedIn;
    UserService.loginWithCookie().then(function ()
    {
        vm.isLoggedIn = UserService.isLoggedIn;
        vm.User = UserService.User;
    }).catch(function (err)
    {
        alert(err.message);
    });
}]);

app.controller('albumsController', ['UserService', function (UserService)
{
    let vm = this;
    vm.User = UserService.User;
}]);

app.controller('loginController', ['UserService', function (UserService)
{

}]);

app.controller('signupController', ['UserService', function (UserService)
{

}]);

app.controller('cartController', ['UserService', function (UserService)
{

}]);
//endregion

//region Services
app.factory('UserService', ['$http', function ($http)
{
    let service = {};
    service.loggedIn = false;
    service.User = {};

    /**
     * @param user: username, password, q1answer, q2answer, email, country, favGenres
     */
    service.register = function (user)
    {
        return $http.post('/register', user).then(function ()
        {
            return $http.post('/register', user).then(function (response)
            {
                service.User = user;
                service.isLoggedIn = true;
            }).catch(function (err)
            {
                Promise.reject(err);
            })
        })
    };

    service.login = function (username, password)
    {
        let userToSend = {username: username, password: password};
        return $http.post('/login', userToSend).then(function (response)
        {
            service.User = response.data;
            service.isLoggedIn = true;
            return Promise.resolve();
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };

    service.loginWithCookie = function ()
    {
        return $http.post('/login', '').then(function (response)
        {
            service.User = response.data;
            service.isLoggedIn = true;
            return Promise.resolve();
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };

    return service;
}]);
//endregion