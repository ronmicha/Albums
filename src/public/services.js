/**
 * User methods
 */
app.factory('UserService', ['$http', '$cookies', function ($http, $cookies)
{
    let service = {};
    service.User = {};
    service.loggedIn = false;

    /**
     * @param user: username, password, q1answer, q2answer, email, country, favGenres
     */
    service.signup = function (user)
    {
        return $http.post('/api/register', user).then(function ()
        {
            return $http.post('/api/register', user).then(function (response)
            {
                service.User = user;
                service.loggedIn = true;
            }).catch(function (err)
            {
                Promise.reject(err);
            })
        })
    };

    service.login = function (username, password)
    {
        let userToSend = {username: username, password: password};
        return $http.post('/api/login', userToSend).then(function (response)
        {
            service.User = response.data;
            service.loggedIn = true;
            return Promise.resolve();
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };

    service.loginWithCookie = function ()
    {
        return $http.post('/api/login', '').then(function (response)
        {
            service.User = response.data;
            service.loggedIn = true;
            return Promise.resolve();
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };

    service.cookieExists = function ()
    {
        return $cookies.get('AlbumShop');
    };

    return service;
}]);

/**
 * Read File
 */
app.factory('DataSource', ['$http', function ($http)
{
    return {
        get: function (file, callback, transform)
        {
            $http.get(file, {transformResponse: transform}).then(function (data)
            {
                callback(data);
            }).catch(function (err)
            {
                //
            });

        }
    };
}]);