/**
 * Validation directive which checks if a username exists in DB
 */
angular.module('AlbumApp').directive('usernameAvailableValidator', ['$http', function ($http)
{
    return {
        require: 'ngModel',
        link: function (scope, elements, attrs, ngModel)
        {
            let apiUrl = attrs.usernameAvailableValidator;

            function setAsLoading(bool)
            {
                ngModel.$setValidity('recordLoading', !bool);
            }

            function setAsAvailable(bool)
            {
                ngModel.$setValidity('recordAvailable', bool);
            }

            ngModel.$parsers.push(function (value)
            {
                if (!value || value.length === 0) return;
                setAsLoading(true);
                setAsAvailable(false);
                $http.get(apiUrl, {
                    params: {
                        name: value
                    }
                }).then(function (response)
                {
                    let exists = response.data['exists'];
                    if (!exists)
                    {
                        setAsLoading(false);
                        setAsAvailable(true);
                    }
                    else
                    {
                        setAsLoading(false);
                        setAsAvailable(false);
                    }
                }).catch(function (err)
                {
                    setAsLoading(true);
                    setAsAvailable(false);
                });
                return value;
            })
        }
    }
}]);