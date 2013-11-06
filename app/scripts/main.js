require.config({
    baseUrl: '/scripts',
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        hoist: './hoist/hoist',
        requirejs: '../bower_components/requirejs/require'
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
        }
    }
});
require(['app', 'jquery','hoist'], function (app) {
    'use strict';
    app.init();
    new app.concept.View.Login();
});
