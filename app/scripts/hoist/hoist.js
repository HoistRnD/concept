/* global define */

define(["jquery", "jquery.cookie"], function($) {
    var Hoist = function() {

    };

    Hoist.prototype = {
        hoistUserKey: 'hoist-user',
        hoistAjaxOptions: {},
        initialize: function(apiKey) {
            Hoist.hoistAjaxOptions = {
                type: 'POST',
                headers: {
                    'Authorization': 'Hoist ' + apiKey
                },
                xhrFields: {
                    withCredentials: true
                }
            };
        },
        isLoggedIn: function() {
            if (this.currentUser()) {
                return true;
            }
            return false;
        },
        currentUser: function() {
            return sessionStorage.getItem(this.hoistUserKey);
        },
        login: function(email, password, onSuccess, onFailure) {
            var options = jQuery.extend({
                url: 'https://auth.hoi.io/login',
                data: {
                    username: email,
                    password: password
                },
                type: 'POST',
                success: function(response) {
                    sessionStorage.setItem(this.hoistUserKey, response);
                    onSuccess();
                }
            }, Hoist.hoistAjaxOptions);
            $.ajax(options);
        },
        signup: function(name, email, password, onSuccess, onFailure) {
            var options = jQuery.extend({
                url: 'https://auth.hoi.io/user',
                data: {
                    name: name,
                    email: email,
                    password: password
                },
                type: 'POST',
                success: function(response) {
                    sessionStorage.setItem(this.hoistUserKey, response);
                    onSuccess();
                }
            }, Hoist.hoistAjaxOptions);
            $.ajax(options);
        }
    };

    return new Hoist();
});
