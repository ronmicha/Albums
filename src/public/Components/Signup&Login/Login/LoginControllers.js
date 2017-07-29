angular.module('AlbumApp').controller('loginController', ['UserService', '$window', function (UserService, $window)
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
                alert(err.data);
            })
    }
}]);

angular.module('AlbumApp').controller('forgotMyPassController', ['UserService', function (UserService)
{
    let vm = this;
    vm.username = '';
    vm.q1a = '';
    vm.q2a = '';
    vm.response = undefined;
    vm.recoverPassword = function (valid)
    {
        if (valid)
            UserService.recoverPassword(vm.username, vm.q1a, vm.q2a).then(function (response)
            {
                vm.response = "Your password is: " + response.data;
            }).catch(function (err)
            {
                vm.response = "Details are incorrect";
            })
    }
}]);