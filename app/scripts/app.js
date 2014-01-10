/*global define */
define(['backbone','template','concept','models','views'], function (backbone,template,concept) {
    'use strict';
    var App = function(){
        this.concept = concept;
        this.template = template;
    };

    App.prototype.init = function(){
        this.template.init();
     //   new this.concept.Navigation();
   //     new this.concept.View.Dashboard();
    };
    return new App();

});
