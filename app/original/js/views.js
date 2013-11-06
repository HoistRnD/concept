var Concept = (function (Concept) {

	Concept.View.Dashboard = Concept.View.extend({
		events: {
			"click .ViewProjects a": "viewProjects",
			"click .AddProject a": "addProject"
		},
		
		el: "#Dashboard",
		
		viewProjects: function () {
			new Concept.View.Projects();
		},
		
		addProject: function () {
			new Concept.View.AddProject();
		}
	});

	Concept.View.Projects = Concept.View.extend({
		events: {
			"click .view": "view"
		},
	
		el: "#ViewProjects",
		
		start: function () {
			this.model = Concept.projects;
		},
		
		view: function (e) {
			var model = this.model.get($(e.target).closest(".item").attr("data-id"));
			
			if (model) {
				new Concept.View.Project({
					model: model
				});
			}
		}
	});

	Concept.View.Project = Concept.View.extend({
		events: {
			"click .DeleteProject": "deleteProject",
			"click .ShareProject": "shareProject",
		
			"click .add": "add",
			"click .ViewDesign": "viewDesign",
			"click .design": "viewDesign"
		},

		el: "#Project",
		
		add: function () {
			var model = this.model;
		
			new Concept.View.AddDesign().on("add", function (design) {
				model.get("Designs").add(design);
			});
		},
		
		viewDesign: function (e) {
			var model = this.model.get("Designs").get($(e.target).closest(".item").attr("data-id"));
		
			if (model) {
				new Concept.View.Design({
					model: model
				});
			}
		},
		
		deleteProject: function () {
			var model = this.model;
		
			new Concept.Confirm({
				Title: "Delete project",
				Message: "Are you sure you want to delete this project?",
				Action: "Delete",
				Callback: function () {
					Concept.projects.remove(model);
					new Concept.View.Dashboard();
				}
			});
		},
		
		shareProject: function () {
			new Concept.View.InviteUser();
		}
	});
	
	Concept.View.AddProject = Concept.View.extend({
		events: {
			"click .add": "add",
			"enter": "add",
			
			"click .content": "swallow",
			"click": "trash"
		},
		
		el: "#AddProject",
		
		add: function () {
			if (!this.validates()) return;
		
			var model = new Concept.Project(this.objectify());
			
			Concept.projects && Concept.projects.add(model);
		
			new Concept.View.Project({
				model: model
			});
			
			this.clear();
			this.trash();
		}
	});
	
	Concept.View.Design = Concept.View.extend({
		events: {
			"click .close": "trash",
			"keydown textarea": "keydown",
			"click .AddComment": "addComment",

			"click .container": "swallow",
			"click": "trash"
		},
	
		el: "#Design",
		
		keydown: function (e) {
			if (e.which == 13) {
				this.addComment();
				e.preventDefault();
			}
		},
		
		addComment: function () {
			var textarea = this.$("textarea");
		
			this.model.get("Comments").add(new Concept.Comment({
				Author: (["Jamie", "Andrew", "Shalita", "Josh", "Helen", "Simon"])[Math.floor(Math.random() * 6)],
				Content: textarea.val()
			}));
			
			textarea.val('');
		}
	});
	
	Concept.View.AddDesign = Concept.View.extend({
		events: {
			"click .add": "add",
			"enter": "add",
			"change :file": "change",
			"click .input-cage a": "upload",
			
			"click .content": "swallow",
			"click": "trash"
		},
	
		el: "#AddDesign",
		
		upload: function () {
			this.$(":file").click();
		},
		
		change: function (e) {
			var a = $(e.target).val();
			a = a.slice(a.lastIndexOf('/') + 1);
			a = a.slice(a.lastIndexOf('\\') + 1);
		
			$(e.target).siblings("[type=text]").val(a);
		},
		
		add: function () {
			if (!this.validates()) return;
			
			var hash = this.objectify();
			
			var file = this.$(":file")[0].files[0];
			
			hash.URL = URL.createObjectURL(file);
		
			this.trigger("add", new Concept.Design(hash));
			
			this.trash();
		}
	});
	
	Concept.View.InviteUser = Concept.View.extend({
		events: {
			"click .content": "swallow",
			"click": "trash"
		},
		
		el: "#InviteUser"
	});
	
	Concept.View.Notifications = Concept.View.extend({
		el: "#Notifications"
	});
	
	return Concept;

})(Concept || {}, Backbone, jQuery);