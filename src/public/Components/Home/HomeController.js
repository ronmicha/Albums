angular.module('AlbumApp').controller('homeController', ['UserService', 'AlbumsService', function (UserService, AlbumsService)
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
}]);