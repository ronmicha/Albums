/**
 * User methods
 */
app.factory('UserService', ['$http', '$cookies', function ($http, $cookies)
{
    let service = {};
    service.User = {};
    service.loggedIn = false;
    let url = '/api';

    /**
     * @param user: username, password, q1answer, q2answer, email, country, favGenres
     */
    service.signup = function (user)
    {
        return $http.post(url + '/register', user).then(function ()
        {
            return $http.post(url + '/register', user).then(function (response)
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
        return $http.post(url + '/login', userToSend).then(function (response)
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
        return $http.post(url + '/login', '').then(function (response)
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
            });

        }
    };
}]);

app.factory('AlbumsService', ['$http', function ($http)
{
    let service = {};
    let url = '/api/albums';
    service.getGenres = function ()
    {
        return $http.get(url + '/genres', '').then(function (response)
        {
            return Promise.resolve(response.data);
        }).catch(function (err)
        {
            Promise.reject(err);
        });
    };
    return service
}]);