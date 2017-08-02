angular.module('AlbumApp').controller('albumsController', ['UserService', 'AlbumsService', function (UserService, AlbumsService)
{
    let vm = this;
    vm.User = UserService.User;
    vm.model = UserService.model;
    vm.Genres = [];
    vm.SelectedGenre = "";
    vm.Albums = {};
    vm.Filters = ['Name', 'Artist', 'Price', 'Rating'];
    vm.SelectedFilter = "";
    vm.SelectedAlbumInGenre = {};

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
                setByGenre(response.data);
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
            alert(err.data);
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

    vm.ScrollLeft = function (genre)
    {
        if (vm.SelectedAlbumInGenre[genre] > 0)
            vm.SelectedAlbumInGenre[genre]--;
    };

    vm.ScrollRight = function (genre)
    {
        if (vm.SelectedAlbumInGenre[genre] < vm.Albums[genre].length-1)
            vm.SelectedAlbumInGenre[genre]++;
    };

    function setByGenre(albums)
    {
        for (var i in albums)
        {
            let genre = albums[i].Genre;
            if (!(genre in vm.Albums))
            {
                vm.Albums[genre] = [];
                vm.SelectedAlbumInGenre[genre] = 0;
            }
            vm.Albums[genre].push(albums[i]);
        }
    }
}]);

/**
 * Order by filter by given property
 */
angular.module('AlbumApp').filter('orderObjectBy', function ()
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