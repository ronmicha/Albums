let app = angular.module('AlbumApp', ['ngRoute', 'LocalStorageModule', 'ngCookies', 'ngMessages']);

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
        templateUrl: "Components/Albums/Albums.html",
        controller: "albumsController",
        controllerAs: "ctrl"
    }).when("/login", {
        templateUrl: "Components/Signup&Login/Login/Login.html",
        controller: "loginController",
        controllerAs: "ctrl"
    }).when("/signup", {
        templateUrl: "Components/Signup&Login/SignUp/Signup.html",
        controller: "signupController",
        controllerAs: "ctrl"
    }).when("/cart", {
        templateUrl: "Components/Cart/Cart.html",
        controller: "cartController",
        controllerAs: "ctrl"
    }).when("/previousOrders", {
        templateUrl: "Components/PreviousOrders/PreviousOrders.html",
        controller: "previousOrdersController",
        controllerAs: "ctrl"
    }).when("/about", {
        templateUrl: "Components/About/About.html"
    }).otherwise({
        templateUrl: "Components/Home/Home.html",
        controller: "homeController",
        controllerAs: "ctrl"
    });
}]);
