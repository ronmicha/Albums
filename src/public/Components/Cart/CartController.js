angular.module('AlbumApp').controller('cartController', ['CartService', 'UserService', function (CartService, UserService)
{
    let vm = this;
    vm.User = UserService.User;
    vm.orderedAlbums = [];
    vm.shownAlbum = {};
    vm.cartTotal = 0;
    vm.getCart = function ()
    {
        CartService.getCart(vm.User.username).then(function (response)
        {
            vm.orderedAlbums = response.data;
            calculateTotal();
        }).catch(function (err)
        {
            alert(err.data);
        });
    };
    vm.addAlbumToCart = function (album)
    {
        let albumID = album.ID;
        CartService.addAlbumToCart(albumID).then(function ()
        {
            calculateTotal();
            alert('Album added to cart');
        }).catch(function (err)
        {
            alert(err.data);
        })
    };
    vm.removeFromCart = function (albumID)
    {
        CartService.removeFromCart(albumID).then(function ()
        {
            vm.getCart();
        }).catch(function (err)
        {
            alert(err.data);
        })
    };
    vm.ShowAlbum = function (album)
    {
        vm.shownAlbum = album;
    };

    function calculateTotal()
    {
        vm.cartTotal = 0;
        for (var i = 0; i < vm.orderedAlbums.length; i++)
            vm.cartTotal += vm.orderedAlbums[i].Price * vm.orderedAlbums[i].Amount;
    }
}]);