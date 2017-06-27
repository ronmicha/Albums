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

app.controller('homeController', ['AlbumsService', 'UserService', function (AlbumsService, UserService)
{
    let vm = this;
    vm.hottestAlbums = {};
    vm.newestAlbums = {};
    vm.isLoggedIn = UserService.loggedIn;
    vm.getHottestAlbums = function ()
    {
        AlbumsService.getHottest()
            .then(function (response)
            {
                vm.hottestAlbums = response.data;
            })
            .catch(function (err)
            {
                alert(err.message);
            })
    };
    vm.getNewestAlbums = function ()
    {
        AlbumsService.getNewest()
            .then(function (response)
            {
                vm.newestAlbums = response.data;
            })
            .catch(function (err)
            {
                alert(err.message);
            })
    };
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

app.controller('signupController', ['UserService', 'DataSource', function (UserService, DataSource)
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

        DataSource.get(countriesFile, catchData, xmlTransform).catch(function (err)
        {
            alert(err);
        });
    }
}]);

app.controller('cartController', ['UserService', function (UserService)
{

}]);