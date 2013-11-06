(function (Backbone) {

	Concept.Navigation = Backbone.View.extend({
		events: {
			"click .ViewProjects": "viewProjects",
			"click .AddProject": "addProject",
			"click .Notifications": "notifications"
		},
	
		el: "#Navigation",
		
		viewProjects: function () {
			new Concept.View.Projects();
		},
		
		addProject: function () {
			new Concept.View.AddProject();
		},
		
		notifications: function () {
			new Concept.View.Notifications();
		}
	});
	
	Concept.Confirm = Backbone.View.extend({
		el: "#Confirm",
		
		events: {
			"click a": "callback",
		
			"click .content": "swallow",
			"click": "remove"
		},
		
		initialize: function () {
			Template.render(this.el, this.options);
			this.$el.show();
		},
		
		callback: function () {
			this.options.Callback.call();
		}
	});

	// base class for views

	Concept.View = Backbone.View.extend({
		initialize: function () {
			var view = this.$el.data("view");
		
			view && view.trash && view.trash();
			
			if (!this.$el.hasClass("modal")) {
				$("section").hide();
			}
			
			this.$el.data("view", this);
			
			var el = this.$el;
			
			this.$el.on("keyup", "[type=text]", function (e) {
				if (e.which == 13) el.trigger("enter");
			});
			
			this.start && this.start();
			
			this._render();
			
			if (this.model) {
				this.listenTo(this.model, "change", this._render);
			}
			
			this.$el.show();
		},
		
		objectify: function () {
			// simple for now
			
			var hash = {};
			
			this.$("[name]").each(function () {
				hash[$(this).attr("name")] = $(this).val();
			});
			
			return hash;
		},
		
		swallow: function (e) {
			e.stopPropagation();
		},
		
		validates: function () {
			var valid = true;
		
			this.$("[required]").each(function () {
				if (!$(this).val()) valid = false;
			});
			
			return valid;
		},
		
		clear: function () {
			this.$("[name]").val('');
		},
		
		_render: function () {
			this.model && Template.render(this.el, this.model);
		},
		
		trash: function () {
			this.stopListening();
			this.undelegateEvents();
			this.off();
			
			this.$el.off();
			this.$el.removeData("view").hide();
			
			this.end && this.end();
		}
	});
	
})(Backbone);