app.controller('mainController', ['UserService', function (UserService)
{
    let vm = this;
    vm.User = {};
    vm.isLoggedIn = UserService.loggedIn;
    vm.init = function ()
    {
        if (!UserService.cookieExists())
            return;
        UserService.loginWithCookie().then(function ()
        {
            vm.isLoggedIn = UserService.loggedIn;
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
    vm.isLoggedIn = false;
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
            vm.isLoggedIn = UserService.loggedIn;
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
    vm.Genres = [];
    vm.SelectedGenre = "";
    vm.Filters = ['Name', 'Artist', 'Price', 'Rating', 'Genre'];
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
            });
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
            UserService.recoverPassword(vm.username, vm.q1a, vm.q2a)
                .then(function (response)
                {
                    vm.response = "Answers are correct! Your password is: " + response.data;
                })
                .catch(function (err)
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

app.controller('cartController', ['UserService', function (UserService)
{

}]);