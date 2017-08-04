angular.module('AlbumApp').controller('albumsController', ['UserService', 'AlbumsService', '$scope', function (UserService, AlbumsService, $scope)
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
    vm.SelectedAlbumInRecommendations = 0;
    vm.SearchQuery = "";

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

    vm.Scroll = function (albums, genre, direction)
    {
        let iterationVar = direction > 0 ? 1 : albums.length - 1;
        vm.SelectedAlbumInGenre[genre] = (vm.SelectedAlbumInGenre[genre] + iterationVar) % albums.length;
    };

    vm.ScrollInRecommendations = function (direction)
    {
        let iterationVar = direction > 0 ? 1 : vm.Recommendations.length - 1;
        vm.SelectedAlbumInRecommendations = (vm.SelectedAlbumInRecommendations + iterationVar) % vm.Recommendations.length;
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

    vm.resetIndexes = function ()
    {
        for (var genre in vm.SelectedAlbumInGenre)
            vm.SelectedAlbumInGenre[genre] = 0;
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