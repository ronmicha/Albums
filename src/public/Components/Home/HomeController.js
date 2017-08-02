angular.module('AlbumApp').controller('homeController', ['UserService', 'AlbumsService', function (UserService, AlbumsService)
{
    let vm = this;
    vm.hottestAlbums = {};
    vm.newestAlbums = {};
    vm.model = UserService.model;
    vm.selectedHotAlbum = 0;
    vm.selectedNewAlbum = 0;

    vm.getHottestAlbums = function ()
    {
        AlbumsService.getHottest().then(function (response)
        {
            vm.hottestAlbums = response.data;
        }).catch(function (err)
        {
            alert(err.data);
        })
    };
    vm.getNewestAlbums = function ()
    {
        AlbumsService.getNewest().then(function (response)
        {
            vm.newestAlbums = response.data;
        }).catch(function (err)
        {
            alert(err.data);
        })
    };

    // Directions is 1/(-1)
    vm.scrollInHot = function (direction)
    {
        if (vm.selectedHotAlbum + direction >= 0 && vm.selectedHotAlbum + direction < vm.hottestAlbums.length)
            vm.selectedHotAlbum += direction;
    };

    // Directions is 1/(-1)
    vm.scrollInNew = function (direction)
    {
        if (vm.selectedNewAlbum + direction >= 0 && vm.selectedNewAlbum + direction < vm.newestAlbums.length)
            vm.selectedNewAlbum += direction;
    };
}]);