app.controller('mainController', ['UserService', function (UserService)
{
    let vm = this;
    vm.User = {};
    vm.model = UserService.model;
    vm.init = function ()
    {
        if (!UserService.cookieExists())
            return;
        UserService.loginWithCookie().then(function ()
        {
            vm.User = UserService.User;
        }).catch(function (err)
        {
            alert(err.message);
        });
    };
}]);

app.controller('homeController', ['UserService', 'AlbumsService', function (UserService, AlbumsService)
{
    let vm = this;
    vm.hottestAlbums = {};
    vm.newestAlbums = {};
    vm.model = UserService.model;
    vm.getHottestAlbums = function ()
    {
        AlbumsService.getHottest().then(function (response)
        {
            vm.hottestAlbums = response.data;
        }).catch(function (err)
        {
            alert(err.message);
        })
    };
    vm.getNewestAlbums = function ()
    {
        AlbumsService.getNewest().then(function (response)
        {
            vm.newestAlbums = response.data;
        }).catch(function (err)
        {
            alert(err.message);
        })
    };
}]);

app.controller('albumsController', ['UserService', 'AlbumsService', function (UserService, AlbumsService)
{
    let vm = this;
    vm.User = UserService.User;
    vm.model = UserService.model;
    vm.Genres = [];
    vm.SelectedGenre = "";
    vm.Filters = ['Name', 'Artist', 'Price', 'Rating'];
    vm.SelectedFilter = "";

    vm.init = function ()
    {
        AlbumsService.getGenres().then(function (data)
        {
            vm.Genres = data;
            return Promise.resolve();
        }).then(function ()
        {
            AlbumsService.getAllAlbums().then(function (response)
            {
                vm.Albums = response.data;
                return Promise.resolve();
            });
        }).then(function ()
        {
            if (vm.model.loggedIn)
                UserService.getRecommendations().then(function (data)
                {
                    vm.Recommendations = data;
                })
        }).catch(function (err)
        {
            alert(err);
        });
    };

    vm.changeGenre = function (genre)
    {
        vm.SelectedGenre = genre;
    };

    vm.changeFilter = function (filter)
    {
        vm.SelectedFilter = filter;
    };
}]);

/**
 * Order by filter by given property
 */
app.filter('orderObjectBy', function ()
{
    return function (input, attribute)
    {
        if (!angular.isObject(input)) return input;

        var array = [];
        for (var objectKey in input)
        {
            array.push(input[objectKey]);
        }
        if (!attribute || attribute === '')
            return array;

        array.sort(function (a, b)
        {
            a = (a[attribute]);
            b = (b[attribute]);
            return a < b ? -1 : 1;
        });
        return array;
    }
});

app.controller('loginController', ['UserService', '$window', function (UserService, $window)
{
    let vm = this;
    vm.User = {};
    vm.login = function (valid)
    {
        if (valid)
            UserService.login(vm.User.Username, vm.User.Password).then(function ()
            {
                $window.location.href = '/';
            }).catch(function (err)
            {
                alert(err.message);
            })
    }
}]);

app.controller('forgotMyPassController', ['UserService', function (UserService)
{
    let vm = this;
    vm.username = '';
    vm.q1a = '';
    vm.q2a = '';
    vm.response = undefined;
    vm.recoverPassword = function (valid)
    {
        if (valid)
            UserService.recoverPassword(vm.username, vm.q1a, vm.q2a).then(function (response)
            {
                vm.response = "Answers are correct! Your password is: " + response.data;
            }).catch(function (err)
            {
                vm.response = "Answers are incorrect";
            })
    }
}]);

app.controller('signupController',
    ['UserService', 'DataSource', 'AlbumsService', '$window', function (UserService, DataSource, AlbumsService, $window)
    {
        let vm = this;
        vm.User = {};
        vm.Countries = [];
        vm.Genres = [];

        vm.signUp = function (valid)
        {
            if (!valid)
                return;
            UserService.signup(vm.User).then(function ()
            {
                $window.location.href = '/';
            }).catch(function (err)
            {
                alert(err);
            });
        };

        vm.init = function ()
        {
            let countriesFile = "./resources/countries.xml";
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

            AlbumsService.getGenres().then(function (data)
            {
                vm.Genres = data;
                DataSource.get(countriesFile, catchData, xmlTransform);
            }).catch(function (err)
            {
                alert(err);
            });
        }
    }]);

app.controller('cartController', ['CartService', 'UserService', function (CartService, UserService)
{
    let vm = this;
    vm.User = UserService.User;
    vm.orderedAlbums = {};
    vm.getCart = function ()
    {
        CartService.getPreviousOrders(vm.User.username)
            .then(function (response)
            {
                vm.orderedAlbums = response.data;
            })
            .catch(function (err)
            {
                alert(err.message);
            });
    }
}]);