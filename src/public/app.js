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
        templateUrl: "views/Albums.html",
        controller: "albumsController",
        controllerAs: "ctrl"
    }).when("/login", {
        templateUrl: "views/Login.html",
        controller: "loginController",
        controllerAs: "ctrl"
    }).when("/signup", {
        templateUrl: "views/Signup.html",
        controller: "signupController",
        controllerAs: "ctrl"
    }).when("/cart", {
        templateUrl: "views/Cart.html",
        controller: "cartController",
        controllerAs: "ctrl"
    }).when("/previousOrders", {
        templateUrl: "views/PreviousOrders.html",
        controller: "previousOrdersController",
        controllerAs: "ctrl"
    }).when("/about", {
        templateUrl: "views/About.html"
    }).otherwise({
        templateUrl: "views/Home.html",
        controller: "homeController",
        controllerAs: "ctrl"
    });
}]);


app.directive('album', function ()
{
    return {
        restrict: 'E', // element
        scope: {
            thisalbum: '='
        },
        replace: true,
        templateUrl: "views/AlbumDirective.html"
        // ,controller: cartController,
        // controllerAs: 'ctrl1'
    };
});

/**
 * Validation directive which checks if a username exists in DB
 */
app.directive('usernameAvailableValidator', ['$http', function ($http)
{
    return {
        require: 'ngModel',
        link: function (scope, elements, attrs, ngModel)
        {
            let apiUrl = attrs.usernameAvailableValidator;

            function setAsLoading(bool)
            {
                ngModel.$setValidity('recordLoading', !bool);
            }

            function setAsAvailable(bool)
            {
                ngModel.$setValidity('recordAvailable', bool);
            }

            ngModel.$parsers.push(function (value)
            {
                if (!value || value.length === 0) return;
                setAsLoading(true);
                setAsAvailable(false);
                $http.get(apiUrl, {
                    params: {
                        name: value
                    }
                }).then(function (response)
                {
                    let exists = response.data['exists'];
                    if (!exists)
                    {
                        setAsLoading(false);
                        setAsAvailable(true);
                    }
                    else
                    {
                        setAsLoading(false);
                        setAsAvailable(false);
                    }
                }).catch(function (err)
                {
                    setAsLoading(true);
                    setAsAvailable(false);
                });
                return value;
            })
        }
    }
}]);