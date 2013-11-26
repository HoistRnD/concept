/* global define */

define(["jquery"], function(jQuery) {
    var Hoist = function() {

    };

    Hoist.prototype = {
        hoistUserKey: 'hoist-user',
        ajaxOptions: {},
        initialize: function(apiKey) {
            self.ajaxOptions = {
                headers: {
                    'Authorization': 'Hoist ' + apiKey
                },
                xhrFields: {
                    withCredentials: true
                }
            };
        },
        isLoggedIn: function() {
            if (self.currentUser()) {
                return true;
            }
            return false;
        },
        currentUser: function() {
            return  JSON.parse(sessionStorage.getItem(self.hoistUserKey)||"null");
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
                    sessionStorage.setItem(self.hoistUserKey,  JSON.stringify(response));
                    onSuccess();
                }
            }, self.ajaxOptions);
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
                    sessionStorage.setItem(self.hoistUserKey,  JSON.stringify(response));
                    onSuccess();
                }
            }, self.ajaxOptions);
            $.ajax(options);
        }
    };
    var self = new Hoist();
    return self;
});
