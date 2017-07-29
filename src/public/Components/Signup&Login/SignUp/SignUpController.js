angular.module('AlbumApp').controller('signupController', ['UserService', 'DataSource', 'AlbumsService', '$window', function (UserService, DataSource, AlbumsService, $window)
{
    let vm = this;
    vm.User = {};
    vm.Countries = [];
    vm.Genres = [];
    vm.SelectedGenres = {};

    vm.signUp = function (valid)
    {
        if (!valid)
            return;
        vm.User.favGenres = [];
        for (var genre in vm.SelectedGenres)
            if (vm.SelectedGenres[genre])
                vm.User.favGenres.push(genre);
        UserService.signup(vm.User).then(function ()
        {
            $window.location.href = '/#/login';
        }).catch(function (err)
        {
            alert(err.data);
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
            alert(err.data);
        });
    }
}]);