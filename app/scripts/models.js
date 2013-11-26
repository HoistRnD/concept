define(['concept', 'backbone', "jquery", "hoist"], function(Concept, Backbone, $, hoist) {
    'use strict';

    function randomId() {
        return Math.floor(Math.random() * 1000);
    }

    Concept.Project = Backbone.Model.extend({
        initialize: function() {
            $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
                options = $.extend(
                    options,
                    hoist.ajaxOptions
                );
                // Your server goes below
                //options.url = 'http://localhost:8000' + options.url;
                console.log(options);
                options.url = 'https://data.hoi.io' + options.url;
            });
            this.set('Designs', new Concept.Designs(this.get('Designs')));
            var self = this;
            this.set('id', randomId());
            this.get('Designs').on('add', function(design) {
                self.set('URL', design.get('URL'));

                self.trigger('change:designs change');
            });
        },
        urlRoot: '/Project',
        url: function(x) {
            return '/Project/'+hoist.currentUser()._id+":" + this.id;
        }
    });

    Concept.Projects = Backbone.Collection.extend({
        model: Concept.Project
    });

    Concept.Design = Backbone.Model.extend({
        initialize: function() {
            this.set('Comments', new Concept.Comments());

            var self = this;

            this.set('id', randomId());

            this.get('Comments').on('add', function() {
                self.trigger('change:comments change');
            });
        }
    });

    Concept.Designs = Backbone.Collection.extend({
        model: Concept.Design
    });

    Concept.Comment = Backbone.Model;

    Concept.Comments = Backbone.Collection.extend({
        model: Concept.Comment
    });

    Concept.projects = new Concept.Projects();

    return Concept;

});
