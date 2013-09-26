// $(Template.init);

var Concept = (function (Concept) {
	Concept.Login = Backbone.View.extend({
		events: {
			"click .login a": "login"
		},
	
		el: "#Login",
		
		login: function () {
			$.ajax({
				type: "POST",
			
				url: "https://auth.hoi.io/login",
				
				dataType: "json",
				
				data: {
					username: this.$("#EmailAddress").val(),
					password: this.$("#Password").val()
				},
				
				headers: {
					Authorization: "Hoist GGIEBOATGWTEFOZZAJ",
					Accept: "application/json"
				}
			});
		}
	});
	
	return Concept;

})(Concept || {});


$(function () {
	new Concept.Login();
});