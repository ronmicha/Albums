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

app.controller('homeController', ['AlbumsService', function (AlbumsService)
{
    let vm = this;
    vm.hottestAlbums = {};
    vm.newestAlbums = {};
    vm.getNewestAlbums = function ()
    {

    }
}]);

app.controller('albumsController', ['UserService', function (UserService)
{
    let vm = this;
    vm.User = UserService.User;
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

app.controller('signupController',
    ['UserService', 'DataSource', 'AlbumsService', function (UserService, DataSource, AlbumsService)
    {
        let vm = this;
        vm.User = {};
        vm.Countries = [];
        vm.Genres = [];

        vm.signUp = function (valid)
        {
            if (!valid)
                return;
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
                vm.Genres = data.map(function (g)
                {
                    return g.Name;
                });
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