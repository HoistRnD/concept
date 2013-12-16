define(['concept', 'backbone', 'template'], function(Concept, Backbone, Template) {
    'use strict';

    Concept.load = function() {
        Hoist.get("comment", function(res) {
                Concept.comments = new Concept.Comments(res);
                Hoist.get("design", function(res1) {
                        Concept.designs = new Concept.Designs(res1);
                        Concept.designs.each(function(design) {
                            Hoist.file("image:" + design.get("_id"), function(res) {
                                design.set("URL", URL.createObjectURL(res));
                            });
                        })
                        Hoist.get("project", function(res2) {
                            Concept.projects = new Concept.Projects(res2);
                            new Concept.Navigation();
                            new Concept.View.Dashboard();
                        }, function(res2) {
                            console.log("projects get unsuccessful: " + res2);
                        });
                    },
                    function(res1) {
                        console.log("designs get unsuccessful: " + res1);
                    });
            },
            function(res) {
                console.log("comments get unsuccessful: " + res);
            });
    };

    Concept.postModel = function(model, type, success, error, context) {
        if (typeof error !== "function") {
            context = error;
            error = null;
        }
        Hoist.post(type, model, function(res) {
            model.set('_rev', res[0]._rev);
            if (model.get("_id") === undefined) {
                model.set("_id", res[0]._id);
            }
            success && success.call(context, res);
        }, function(res) {
            console.log(type + " post unsuccessful: " + res);
            error && error.call(context, res);
        }, context);
    }

    Concept.Navigation = Backbone.View.extend({
        events: {
            'click .ViewProjects': 'viewProjects',
            'click .AddProject': 'addProject',
            'click .Notifications': 'notifications'
        },

        el: '#Navigation',

        viewProjects: function() {
            new Concept.View.Projects();
        },

        addProject: function() {
            new Concept.View.AddProject();
        },

        notifications: function() {
            new Concept.View.Notifications();
        }
    });

    Concept.Confirm = Backbone.View.extend({
        el: '#Confirm',

        events: {
            'click a': 'callback',

            'click .content': 'swallow',
            'click': 'remove'
        },

        initialize: function() {
            Template.render(this.el, this.options);
            this.$el.show();
        },

        callback: function() {
            this.options.Callback.call();
        }
    });

    // base class for views

    Concept.View = Backbone.View.extend({
        initialize: function() {
            var view = this.$el.data('view');

            if (view && view.trash) {
                view.trash();
            }

            if (!this.$el.hasClass('modal')) {
                $('section').hide();
            }

            this.$el.data('view', this);

            var el = this.$el;

            this.$el.on('keyup', '[type=text]', function(e) {
                if (e.which === 13) {
                    el.trigger('enter');
                }
            });

            if (this.start) {
                this.start();
            }

            this._render();

            if (this.model) {
                this.listenTo(this.model, 'change', this._render);
            }

            this.$el.show();
        },

        objectify: function() {
            // simple for now

            var hash = {};

            this.$('[name]').each(function() {
                hash[$(this).attr('name')] = $(this).val();
            });

            return hash;
        },

        swallow: function(e) {
            e.stopPropagation();
        },

        validates: function() {
            var valid = true;

            this.$('[required]').each(function() {
                if (!$(this).val()) {
                    valid = false;
                }
            });

            return valid;
        },

        clear: function() {
            this.$('[name]').val('');
        },

        _render: function() {
            if (this.model) {
                Template.render(this.el, this.model);
            }
        },

        trash: function() {
            this.stopListening();
            this.undelegateEvents();
            this.off();

            this.$el.off();
            this.$el.removeData('view').hide();

            if (this.end) {
                this.end();
            }
        }
    });

    Concept.View.Dashboard = Concept.View.extend({
        events: {
            'click .ViewProjects a': 'viewProjects',
            'click .AddProject a': 'addProject'
        },

        el: '#Dashboard',

        viewProjects: function() {
            Concept.projects.each(function(project) {
                if (project.get('Designs')) {
                    project.set('URL', project.get('Designs').at(0).get('URL'));
                }
            });
            new Concept.View.Projects();
        },

        addProject: function() {
            new Concept.View.AddProject();
        }
    });

    Concept.View.Projects = Concept.View.extend({
        events: {
            'click .view': 'view'
        },

        el: '#ViewProjects',

        start: function() {
            this.model = Concept.projects;
        },

        view: function(e) {
            var model = this.model.get($(e.target).closest('.item').attr('data-id'));
            //  console.log($(e.target).closest('.item').attr('data-id'));
            if (model) {
                new Concept.View.Project({
                    model: model
                });
            }
        }
    });

    Concept.View.Project = Concept.View.extend({
        events: {
            'click .DeleteProject': 'deleteProject',
            'click .ShareProject': 'shareProject',

            'click .add': 'add',
            'click .ViewDesign': 'viewDesign',
            'click .AddComment': 'addComment',
            'click .design': 'viewDesign'
        },

        el: '#Project',

        start: function() {
            this.model.on("change:designs", this.post, this);
            this.model.on("change", this._render, this);
        },

        add: function() {
            var model = this.model;

            new Concept.View.AddDesign({
                model: model
            });
        },

        viewDesign: function(e) {
            var model = this.model.get('Designs').get($(e.target).closest('.item').attr('data-id'));

            if (model) {
                new Concept.View.Design({
                    model: model
                });
            }
        },

        addComment: function(e) {
            var model = this.model.get('Designs').get($(e.target).closest('.item').attr('data-id'));

            if (model) {
                new Concept.View.Design({
                    model: model
                });
            }
        },

        deleteProject: function() {
            var model = this.model;

            new Concept.Confirm({
                Title: 'Delete project',
                Message: 'Are you sure you want to delete this project?',
                Action: 'Delete',
                Callback: function() {
                    Concept.projects.remove(model);
                    new Concept.View.Dashboard();
                }
            });
        },

        shareProject: function() {
            new Concept.View.InviteUser();
        },

        post: function() {
            Concept.postModel(this.model, "project");
        }
    });

    Concept.View.AddProject = Concept.View.extend({
        events: {
            'click .add': 'add',
            'enter': 'add',

            'click .content': 'swallow',
            'click': 'trash'
        },

        el: '#AddProject',

        add: function() {
            if (!this.validates()) {
                return;
            }

            var project = new Concept.Project(this.objectify());
            if (Concept.projects) {
                Concept.postModel(project, "project");
                Concept.projects.add(project);
            } else {
                Concept.projects = [project];
            }
            new Concept.View.Project({
                model: project
            });

            this.clear();
            this.trash();
        }
    });

    Concept.View.Design = Concept.View.extend({
        events: {
            'click .close': 'trash',
            'keydown textarea': 'keydown',
            'click .AddComment': 'addComment',

            'click .container': 'swallow',
            'click': 'trash'
        },

        start: function() {
            this.model.on("change:comments", this.post, this);
        },

        el: '#Design',

        keydown: function(e) {
            if (e.which === 13) {
                this.addComment();
                e.preventDefault();
            }
        },

        addComment: function() {
            var textarea = this.$('textarea');
            var comment = new Concept.Comment({
                Author: (['Jamie', 'Andrew', 'Shalita', 'Josh', 'Helen', 'Simon'])[Math.floor(Math.random() * 6)],
                Content: textarea.val()
            });
            var that = this;
            Concept.postModel(comment, "comment");
            that.model.get('Comments').add(comment);
            textarea.val('');
        },

        post: function() {
            Concept.postModel(this.model, "design");
        }
    });

    Concept.View.AddDesign = Concept.View.extend({
        events: {
            'click .add': 'add',
            'enter': 'add',
            'change :file': 'change',
            'click .input-cage a': 'upload',

            'click .content': 'swallow',
            'click': 'trash'
        },

        el: '#AddDesign',

        upload: function() {
            this.$(':file').click();
        },

        change: function(e) {
            var a = $(e.target).val();
            a = a.slice(a.lastIndexOf('/') + 1);
            a = a.slice(a.lastIndexOf('\\') + 1);

            $(e.target).siblings('[type=text]').val(a);
        },

        add: function() {
            if (!this.validates()) {
                return;
            }

            var hash = this.objectify();

            var file = this.$(':file')[0].files[0];

            //    hash.URL = URL.createObjectURL(file);

            var design = new Concept.Design(hash);
            var project = this.model;
            Concept.postModel(design, "design", function() {
                Hoist.file("image:" + design.get("_id"), file, function(res) {
                    Hoist.file("image:" + design.get("_id"), function(res) {
                        design.set("URL", URL.createObjectURL(res));
                    });
                }, function(res) {
                    console.log("file post unsuccessful: " + res, this);
                });
                this.model.get("Designs").add(design);
            }, this);
            this.trash();
        }
    });

    Concept.View.InviteUser = Concept.View.extend({
        events: {
            'click .content': 'swallow',
            'click': 'trash'
        },

        el: '#InviteUser'
    });

    Concept.View.Notifications = Concept.View.extend({
        el: '#Notifications'
    });

    Concept.View.Login = Concept.View.extend({
        events: {
            'click .login a': 'login',
            'click .signup a': 'signup'
        },

        el: '#Login',

        login: function() {
            Hoist.login({
                username: this.$('#EmailAddress').val(),
                password: this.$('#Password').val()
            }, function() {
                Concept.load();
            });
            return false;

        },
        signup: function() {
            new Concept.View.SignUp();
        }

    });
    Concept.View.SignUp = Concept.View.extend({
        events: {
            'click .signup a': 'signup'
        },

        el: '#SignUp',

        signup: function() { // should probably check that password and repeat password match
            Hoist.signup({
                name: this.$('#Name').val(),
                email: this.$('#EmailAddress').val(),
                password: this.$('#Password').val()
            }, function() {
                Concept.load();
            });
            return false;
        }

    });
    return Concept;

});