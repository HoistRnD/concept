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
            includeInJSON: "_id",
            keyDestination: 'Designs',
            autofetch: false,
            reverseRelation: {
                key: 'project',
                includeInJSON: false
            }
        }],

        initialize: function() {
            // $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
            //     options = $.extend(
            //         options,
            //         hoist.ajaxOptions
            //     );
            //     // Your server goes below
            //     //options.url = 'http://localhost:8000' + options.url;
            //     console.log(options);
            //     options.url = 'https://data.hoi.io' + options.url;
            // });
            var self = this;
            // // this.set('id', randomId());
            this.get('Designs').on('add', function(design) {
                //  self.set('URL', design.get('URL'));
                self.trigger('change:designs change');
            });
        },
        // urlRoot: '/project',
        // url: function(x) {
        //     return '/project/' + this.id;
        // }
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
            includeInJSON: Backbone.Model.prototype.idAttribute,
            keyDestination: "Comments",
            autofetch: false,
            reverseRelation: {
                key: 'Design',
                includeInJSON: false
            }
        }],
        
        initialize: function() {

            var self = this;

            // this.set('id', randomId());

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

    Concept.projects = new Concept.Projects();

    return Concept;

});