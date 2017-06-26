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
    }).when("/", {
            templateUrl: "views/Home.html",
            controller: "homeController"
        }
    ).otherwise({
        redirect: '/'
    });
}]);

//region Controllers
app.controller('mainController', ['UserService', '$scope', function (UserService, $scope)
{
    let vm = this;
    vm.isLoggedIn = UserService.isLoggedIn;
    vm.init = function ()
    {
        if (!UserService.cookieExists())
            return;
        UserService.loginWithCookie().then(function ()
        {
            vm.isLoggedIn = UserService.isLoggedIn;
            vm.User = UserService.User;
        }).catch(function (err)
        {
            alert(err.message);
        });
    };

}]);

app.controller('homeController', ['UserService', function (UserService)
{

}]);

app.controller('albumsController', ['UserService', function (UserService)
{
    let vm = this;
    vm.User = UserService.User;
}]);

app.controller('loginController', ['UserService', function (UserService)
{

}]);

app.controller('signupController', ['UserService', 'DataSource', '$scope', function (UserService, DataSource, $scope)
{
    let vm = this;
    vm.User = {};
    vm.Countries = [];

    vm.signUp = function (valid)
    {
        if (!valid)
            return;
    };

    vm.init = function ()
    {
        let countriesFile = "/resources/countries.xml";
        let xmlTransform = function (data)
        {
            console.log("transform data");
            var x2js = new X2JS();
            var json = x2js.xml_str2json(data);
            return json;
        };

        let catchData = function (data)
        {
            vm.Countries = data.data.Countries.Country;
        };

        DataSource.get(countriesFile, catchData, xmlTransform).catch(function (err)
        {
            alert(err);
        });
    }
}]);

/**
 * Directive for checking if a username exists in DB
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
                    setAsLoading(false);
                    setAsAvailable(false);
                });
                return value;
            })
        }
    }
}]);

app.controller('cartController', ['UserService', function (UserService)
{

}]);
//endregion

//region Services
/**
 * User methods
 */
app.factory('UserService', ['$http', '$cookies', function ($http, $cookies)
{
    let service = {};
    service.loggedIn = false;
    service.User = {};

    /**
     * @param user: username, password, q1answer, q2answer, email, country, favGenres
     */
    service.signup = function (user)
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

    service.cookieExists = function ()
    {
        return $cookies.get('AlbumShop');
    };

    return service;
}]);

/**
 * Read File
 */
app.factory('DataSource', ['$http', function ($http)
{
    return {
        get: function (file, callback, transform)
        {
            $http.get(file, {transformResponse: transform}).

                then(function (data)
                {
                    callback(data);
                });

        }
    };
}]);
//endregion