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
    })
    // .when("/", {
    //     templateUrl: "views/Home.html",
    //     controller: "homeController"
    // })
        .otherwise({
            templateUrl: "views/Home.html",
            controller: "homeController"
        });
}]);


app.directive('album', function ()
{
    return {
        restrict: 'AE', //attribute or element
        scope: {
            myalbum: '='
        },
        replace: true,
        // template: '<div class="some">' +
        // '<input ng-model="thisAlbum"></div>',
        templateUrl: "views/AlbumDirective.html",
        link: function ($scope, elem, attr, ctrl)
        {
            console.debug($scope);
        }
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