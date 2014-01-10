require.config({
    baseUrl: '/scripts',
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        relational: '../bower_components/backbone-relational/backbone-relational',
        hoist: './hoist/hoist',
        requirejs: '../bower_components/requirejs/require',
        "jquery.cookie": "../bower_components/jquery.cookie/jquery.cookie"
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        relational: {
            deps: ['backbone']
        }
    }
});
require(['app', 'jquery', 'hoist'], function(app, $) {
    'use strict';
    app.init();
    var apiKey = 'put apiKey here'; // replace with the api key for your app
    Hoist.apiKey(apiKey);
    Hoist.status(function() {
            app.concept.load();
        },
        function(res) {
            new app.concept.View.Login();
        });

});
