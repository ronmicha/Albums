angular.module('AlbumApp').controller('previousOrdersController', ['UserService', function (UserService)
{
    let vm = this;
    vm.Orders = {};
    vm.ShownOrder = {};
    vm.OrderAlbums = [];

    vm.init = function ()
    {
        UserService.getPreviousOrders().then(function (data)
        {
            vm.Orders = data;
        }).catch(function (err)
        {
            alert(err.data);
        })
    };

    vm.ShowOrder = function (order)
    {
        vm.ShownOrder = order;
        UserService.getOrderAlbums(order.ID).then(function (data)
        {
            vm.OrderAlbums = data;
        }).catch(function (err)
        {
            alert(err.data);
        })
    };
}]);