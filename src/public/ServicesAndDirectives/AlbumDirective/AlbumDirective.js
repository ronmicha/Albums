angular.module('AlbumApp').directive('album', function ()
{
    return {
        restrict: 'E', // element
        scope: {
            thisalbum: '='
        },
        replace: true,
        templateUrl: "ServicesAndDirectives/AlbumDirective/AlbumDirective.html"
        // ,controller: cartController,
        // controllerAs: 'ctrl1'
    };
});