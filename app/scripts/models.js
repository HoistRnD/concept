define(['concept', 'backbone'], function(Concept, Backbone) {
    'use strict';

    function randomId() {
        return Math.floor(Math.random() * 1000);
    }

    Concept.Project = Backbone.Model.extend({
        initialize: function() {
            this.set('Designs', new Concept.Designs(this.get('Designs')));

            var self = this;

            this.set('id', randomId());

            this.get('Designs').on('add', function(design) {
                self.set('URL', design.get('URL'));

                self.trigger('change:designs change');
            });
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
