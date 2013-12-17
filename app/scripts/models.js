define(['concept', 'backbone', "jquery", 'relational'], function(Concept, Backbone, $) {
    'use strict';

    Backbone.Relational.store.addModelScope(Concept);
    Backbone.Relational.store.removeModelScope(window);

    function randomId() {
        return Math.floor(Math.random() * 1000);
    }

    Concept.Project = Backbone.RelationalModel.extend({
        idAttribute: "_id",

        relations: [{
            type: Backbone.HasMany,
            key: 'Designs',
            relatedModel: 'Design',
            collectionType: 'Designs',
            includeInJSON: '_id',
            keyDestination: 'Designs',
            autofetch: false,
            reverseRelation: {
                key: 'project',
                includeInJSON: false
            }
        }],

        initialize: function() {
            var self = this;
            this.get('Designs').on('add', function(design) {
                self.trigger('change:designs change');
                design.on('change', function(){
                    self.set('URL', design.get('URL'));
                    self.trigger('change');
                })
            });
        },
        
        defaults: {
            URL: ""
        }
    });

    Concept.Projects = Backbone.Collection.extend({
        model: Concept.Project
    });

    Concept.Design = Backbone.RelationalModel.extend({
        idAttribute: "_id",

        relations: [{
            type: Backbone.HasMany,
            key: 'Comments',
            relatedModel: 'Comment',
            collectionType: 'Comments',
            includeInJSON: '_id',
            keyDestination: 'Comments',
            autofetch: false,
            reverseRelation: {
                key: 'Design',
                includeInJSON: false
            }
        }],

        initialize: function() {

            var self = this;

            this.get('Comments').on('add', function() {
                self.trigger('change:comments change');
            });
        },
    });

    Concept.Designs = Backbone.Collection.extend({
        model: Concept.Design
    });

    Concept.Comment = Backbone.RelationalModel.extend({
        idAttribute: "_id",
    });

    Concept.Comments = Backbone.Collection.extend({
        model: Concept.Comment
    });

    return Concept;

});