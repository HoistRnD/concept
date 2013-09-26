var Template = (function () {
	function escape(s) {
		return s.replace(/-/g, "-=");
	}
	
	function unescape(s) {
		return s.replace(/-=/g, "-");
	}
	
	function get(model, field, nothing) {
		if (field == ".") return model || nothing;
	
		return model && (model.attributes || model)[field] || nothing;
	}
	
	var strs = {
		beginMagic: "Hoist.Templates.BeginConstruct",
		endMagic: "Hoist.Templates.EndConstruct",
		iterateOver: "data-iterate-over",
		ifEmpty: "data-if-empty",
		setAttributePrefix: "data-set-",
		hasSetter: "data-set",
		template: "data-content",
		hasConstruct: "data-has-construct",
		attrs: {}
	};
	
	strs.attrs[strs.iterateOver] = "expandIterateOver";
	strs.attrs[strs.ifEmpty] = "expandIfEmpty";
	
	return {
	
		init: function () {
			var node = document, val;
			
			// need to go in reverse document order (I think...)
			
			while (node.lastElementChild) node = node.lastElementChild;
			
			while (node != document) {
				// visit node
				
				for (var i = 0; i < node.attributes.length; i++) {
					var attr = node.attributes[i].nodeName;
				
					if (attr == strs.template || attr.slice(0, strs.setAttributePrefix.length) == strs.setAttributePrefix) {
						node.setAttribute(strs.hasSetter, "");
						break;
					}
				}
				
				for (var attr in strs.attrs) {
					if (val = node.getAttribute(attr)) {
						node.removeAttribute(attr);

						var parent = node.parentNode, html = node.outerHTML;
						var comment = node.ownerDocument.createComment(strs.beginMagic + attr + " " + val + " " + escape(html));
					
						parent.insertBefore(comment, node);
						parent.insertBefore(node.ownerDocument.createComment(strs.endMagic), node);
						parent.removeChild(node);
					
						parent.setAttribute(strs.hasConstruct, "");
					
						node = comment;
						break;
					}
				}
				
				if (node.previousElementSibling) {
					node = node.previousElementSibling;
					while (node.lastElementChild) node = node.lastElementChild;
				} else {
					node = node.parentNode;
				}
			}
					
// 			for (var i = nodes.length - 1; i >= 0; i--) {
// 				var el = nodes[i], parent = el.parentNode;
// 				var html = el.outerHTML;
// 				var field = el.getAttribute("data-iterate-over");
// 				
// 				parent.insertBefore(el.ownerDocument.createComment(beginIterateOver + field + " " + escape(html)), el);
// 				parent.insertBefore(el.ownerDocument.createComment(endIterateOver), el);
// 				parent.removeChild(el);
// 				
// 				parent.setAttribute("data-has-iterator", "");
// 			}
		},
		
// 		dispose: function (el) {
// 			$("[data-has-iterator]", el).each(function () {
// 				var nodes = this.childNodes;
// 			
// 				for (var i = nodes.length - 1; i >= 0; i--) {
// 					var node = nodes[i];
// 			
// 					if (node.nodeType == 8 && nodes.nodeValue == endIterateOver) {
// 						i--;
// 						
// 						while (i >= 0 && nodes[i].nodeType != 8 || nodes[i].nodeValue.slice(0, beginIterateOver.length)) {
// 							parent.removeChild(nodes[i--]);
// 						}
// 					}
// 				}
// 			});
// 		},
	
		render: function (el, model) {
			// this is good for now, but should be an actual DOM traversal so it doesn't replace tags in old iterate instances
		
			var elsWithSetter = $("[" + strs.hasSetter + "]", el);

			if (el.hasAttribute(strs.hasSetter)) {
				elsWithSetter = elsWithSetter.add(el);
			 }
			
			elsWithSetter.each(function () {
				var attrs = {};
				
				for (var i = 0; i < this.attributes.length; i++) {
					var attr = this.attributes[i].nodeName;

					if (attr == strs.template) {
						while (this.lastChild) this.removeChild(this.lastChild);
						
						this.appendChild(this.ownerDocument.createTextNode(Template.replace(this.attributes[i].nodeValue, model)));
					}
					
					else if (attr.slice(0, strs.setAttributePrefix.length) == strs.setAttributePrefix) {
						attrs[attr.slice(strs.setAttributePrefix.length)] = Template.replace(this.attributes[i].nodeValue, model);
					}
				}
				
				for (var x in attrs) {
					this.setAttribute(x, attrs[x]);
				}
			});
			
			var elsWithConstruct = $("[" + strs.hasConstruct + "]", el);
			
			if (el.hasAttribute(strs.hasConstruct)) {
				elsWithConstruct = elsWithConstruct.add(el);
			}
			
			elsWithConstruct.each(function () {
				Template.expand(this, model);
			});
		},
		
		replace: function (template, model) {
			return template.replace(/\[(.+)\]/g, function (tag, name) {
				return get(model, name, "");
			});
		},
		
		expandIterateOver: function (html, node, model) {
			if (!model) return;
			if (model.models) model = model.models;
			if (!model.length) return;
					
			for (var i = 0; i < model.length; i++) {
				var newNode = $(html)[0];
				this.render(newNode, model[i]);
						
				node.parentNode.insertBefore(newNode, node);
			}
		},
		
		expandIfEmpty: function (html, node, model) {
			if (!model || !model.models && !model.length || model.models && !model.models.length) {			
				var newNode = $(html)[0];
				this.render(newNode, model);
			
				node.parentNode.insertBefore(newNode, node);
			}
			
			return node;
		},
		
		expand: function (el, model) {
			var parent = el.jquery ? el[0] : el;
			
			for (var node = parent.firstChild; node; node = node.nextSibling) {
				if (node.nodeType == 8) {
					var content = node.nodeValue;
					
					if (content.slice(0, strs.beginMagic.length) != strs.beginMagic) continue;
					
					content = content.slice(strs.beginMagic.length);
					
					var space = content.indexOf(' ');
					var attr = content.slice(0, space);
					content = content.slice(space + 1);

					space = content.indexOf(' ');
					var field = content.slice(0, space);
					
					content = unescape(content.slice(space + 1));
					
					while(node.nextSibling.nodeType != 8 || node.nextSibling.nodeValue != strs.endMagic) {
						parent.removeChild(node.nextSibling);
					}
					
					node = node.nextSibling;
					
					this[strs.attrs[attr]](content, node, get(model, field));
				}
			}
		}
	};
})();