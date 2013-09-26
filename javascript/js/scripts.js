(function () {
	this.showSection = function (id) {
		var show = document.getElementById(id);
		show.style.display = "block";
		
		var show = $("#" + id);
		
		if (!show.hasClass("modal")) {
			$("section").not(show).hide();
			show.show();
		}
		
		$("nav").each(function () {
			$(this).toggleClass("active", $(this).hasClass(id));
		});
	};
	
	this.killModal = function () {
		$("section.modal").hide();
	};
})();