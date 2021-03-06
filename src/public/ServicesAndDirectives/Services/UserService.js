angular.module('AlbumApp').factory('UserService', ['$http', '$cookies', function ($http, $cookies)
{
    let service = {};
    service.User = {};
    service.model = {loggedIn: false, lastLoggedIn: null};
    let url = '/api';

    let updateLastLogin = function ()
    {
        let cookie = $cookies.get('AlbumShop');
        service.model.lastLoggedIn = cookie.split('\"')[9];
    };

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
            // updateLastLogin();
            // service.model.loggedIn = true;
            return Promise.resolve();
        }).catch(function (err)
        {
            return Promise.reject(err);
        })
    };

    service.login = function (username, password)
    {
        let userToSend = {username: username, password: password};
        return $http.post(url + '/login', userToSend).then(function (response)
        {
            service.User = response.data;
            updateLastLogin();
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
            updateLastLogin();
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

    service.getPreviousOrders = function ()
    {
        let thisUrl = url + '/users';
        return $http.get(thisUrl + '/previousOrders').then(function (response)
        {
            return Promise.resolve(response.data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        });
    };

    service.getOrderAlbums = function (orderID)
    {
        let thisUrl = url + '/users';
        let config = {
            params: {
                orderID: orderID
            }
        };
        return $http.get(thisUrl + '/albumsOfOrder', config).then(function (response)
        {
            return Promise.resolve(response.data);
        }).catch(function (err)
        {
            return Promise.reject(err);
        });
    };

    return service;
}]);
