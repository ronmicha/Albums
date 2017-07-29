angular.module('AlbumApp').controller('mainController', ['UserService', function (UserService)
{
    let vm = this;
    vm.User = {};
    vm.model = UserService.model;
    vm.init = function ()
    {
        if (!UserService.cookieExists())
            return;

        UserService.loginWithCookie().then(function ()
        {
            vm.User = UserService.User;
        }).catch(function (err)
        {
            alert(err.data);
        });
    };
}]);