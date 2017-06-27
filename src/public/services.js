/**
 * User methods
 */
app.factory('UserService', ['$http', '$cookies', function ($http, $cookies)
{
    let service = {};
    service.User = {};
    service.model = {loggedIn: false};
    let url = '/api';

    /**
     * @param user: username, password, q1answer, q2answer, email, country, favGenres
     */
    service.signup = function (user)
    {
        /* username, password, q1answer, q2answer, email, country - mandatory
         * favGenres - optional*/
        let body = {
            username: user.username, password: user.password, q1answer: user.q1answer,
            q2answer: user.q2answer, email: user.email, country: user.country, favGenres: user.favGenres
        };
        return $http.post(url + '/register', body).then(function ()
        {
            service.User = user;
            service.model.loggedIn = true;
            return Promise.resolve();
        }).catch(function (err)
        {
            return Promise.reject(err.data);
        })
    };

    service.login = function (username, password)
    {
        let userToSend = {username: username, password: password};
        return $http.post(url + '/login', userToSend).then(function (response)
        {
            service.User = response.data;
            service.model.loggedIn = true;
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
            service.model.loggedIn = true;
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

    service.recoverPassword = function (username, q1a, q2a)
    {
        let userDetails = {username: username, q1answer: q1a, q2answer: q2a};
        return $http.post(url + '/passwordRecover', userDetails).then(function (response)
        {
            return Promise.resolve(response);
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };

    service.getRecommendations = function ()
    {
        let thisUrl = url + '/users';
        return $http.get(thisUrl + '/recommend', '').then(function (response)
        {
            return Promise.resolve(response.data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        });
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
            let genres = response.data.map(function (g)
            {
                return g.Name;
            });
            return Promise.resolve(genres);
        }).catch(function (err)
        {
            return Promise.reject(err);
        });
    };
    service.getHottest = function ()
    {
        return $http.get(url + '/hottest').then(function (data)
        {
            return Promise.resolve(data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        });
    };
    service.getNewest = function ()
    {
        return $http.get(url + '/newest').then(function (data)
        {
            return Promise.resolve(data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        });
    };

    service.getAllAlbums = function ()
    {
        return $http.get(url + '/search').then(function (data)
        {
            return Promise.resolve(data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };
    return service
}]);

app.factory('CartService', ['$http', function ($http)
{
    let service = {};
    let url = '/api/users';
    service.getPreviousOrders = function (username)
    {
        return $http.get(url + '/previousOrders')
            .then(function ()
            {

            })
            .catch()
    };
    return service;
}]);