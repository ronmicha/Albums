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
        let iterationVar = direction > 0 ? 1 : vm.hottestAlbums.length - 1;
        vm.selectedHotAlbum = (vm.selectedHotAlbum + iterationVar) % vm.hottestAlbums.length;
    };

    // Directions is 1/(-1)
    vm.scrollInNew = function (direction)
    {
        let iterationVar = direction > 0 ? 1 : vm.newestAlbums.length - 1;
        vm.selectedNewAlbum = (vm.selectedNewAlbum + iterationVar) % vm.newestAlbums.length;
    };
}]);