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
    Hoist.apiKey('KUCCCEGNXPOJPEJEQOUW');
    Hoist.status(function() {
            Hoist.get("design", function(res1) {
                    app.concept.designs = new app.concept.Designs(res1);
                    console.log(app.concept.designs);
                    Hoist.get("project", function(res2) {
                        app.concept.projects = new app.concept.Projects(res2);
                    console.log(app.concept.projects);
                        new app.concept.View.Dashboard();
                    }, function(res2) {
                        console.log("projects get unsuccessful: " + res2);
                    });
                },
                function(res1) {
                    console.log("projects get unsuccessful: " + res1);
                });
        },
        function(res) {
            new app.concept.View.Login();
        });

});