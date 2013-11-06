define(function() {
    'use strict';
    function escape(s) {
        return s.replace(/-/g, '-=');
    }

    function unescape(s) {
        return s.replace(/-=/g, '-');
    }

    function get(model, key, nothing) {
        // read initial dots to move back in the stack

        for (var i = 0; i < key.length - 1; i++) {
            if (key[i] !== '.') {
                break;
            }
        }

        if (i) {
            key = key.slice(i);
        }

        model = model[model.length - i - 1];

        if (!key || key === '.') {
            return model || nothing;
        }

        if (key.indexOf('.') === -1) {
            return model && (model.attributes || model)[key] || nothing;
        } else {
            key = key.split('.');
        }

        if (!model) {
            return nothing;
        }

        var at = model;

        for (var j = 0; j < key.length; j++) {
            if (at.attributes) {
                at = at.attributes;
            } else if (at.models) {
                at = at.models;
            }

            at = at[key[j]];

            if (at === null) {
                return nothing;
            }
        }

        return at;
    }
    //  function get(model, field, nothing) {
    //      if (field == '.') return model || nothing;
    //
    //      return model && (model.attributes || model)[field] || nothing;
    //  }

    function vivify(html, doc) {
        var div = (doc || document).createElement('div');
        div.innerHTML = html;
        return div.firstChild;
    }

    var strs = {
        beginMagic: 'Hoist.Templates.BeginConstruct',
        endMagic: 'Hoist.Templates.EndConstruct',
        iterateOver: 'data-each',
        setAttributePrefix: 'data-set-',
        hasSetter: 'data-set',
        template: 'data-content',
        hasConstruct: 'data-has-construct',

        constructs: {
            'data-each': 'expandIterateOver',
            'data-if-empty': 'expandIfEmpty',
            'data-if-nonempty': 'expandIfNonEmpty',
            'data-if': 'expandIf',
            'data-if-not': 'expandIfNot'
        }
    };

    var Template = {

        init: function() {
            var scope = document,
                node = scope,
                val;

            // traverse in reverse document order

            while (node.lastChild) {
                node = node.lastChild;
            }

            while (node !== scope) {
                // visit node

                if (node.nodeType === 1) {
                    var hasSetter = false,
                        putSetters = [];

                    for (var i = 0; i < node.attributes.length; i++) {
                        var attr = node.attributes[i];

                        if (attr.nodeName === strs.template || attr.nodeName.slice(0, strs.setAttributePrefix.length) === strs.setAttributePrefix) {
                            hasSetter = true;
                        } else {
                            // set the setter automagically if you figure out it's a template

                            if (attr.nodeValue.indexOf('[') > -1) {
                                putSetters.push(attr);
                            }
                        }
                    }

                    if (putSetters.length || hasSetter) {
                        node.setAttribute(strs.hasSetter, '');
                    }

                    for (var j = 0; j < putSetters.length; j++) {
                        node.setAttribute(strs.setAttributePrefix + putSetters[j].nodeName, putSetters[j].nodeValue);
                        node.removeAttribute(putSetters[j].nodeName);
                    }

                    for (var attrib in strs.constructs) {
                        if (node.hasAttribute(attrib)) {
                            val = node.getAttribute(attrib);
                            node.removeAttribute(attrib);

                            var parent = node.parentNode,
                                html = node.outerHTML;
                            var comment = node.ownerDocument.createComment(strs.beginMagic + attrib + ' ' + val + ' ' + escape(html));

                            parent.insertBefore(comment, node);
                            parent.insertBefore(node.ownerDocument.createComment(strs.endMagic), node);
                            parent.removeChild(node);

                            parent.setAttribute(strs.hasConstruct, '');

                            node = comment;
                            break;
                        }
                    }
                } else if (node.nodeType === 3) {
                    // set the setter automagically if you figure out it's a template

                    if (node.nodeValue.indexOf('[') > -1 && node.parentNode.nodeType === 1) {
                        node.parentNode.setAttribute(strs.template, node.nodeValue);
                    }
                }

                if (node.previousSibling) {
                    node = node.previousSibling;
                    while (node.lastChild) {
                        node = node.lastChild;
                    }
                } else {
                    node = node.parentNode;
                }
            }
        },

        render: function(el, model) {
            if (el.jquery) {
                el = el[0];
            }
            var node = el,
                attrs, doc = node.ownerDocument;

            if (!this.stack) {
                this.stack = [];
            }
            this.stack.push(model);

            while (node) {
                // visit on the way down

                if (node.nodeType === 1) {

                    if (node.hasAttribute(strs.hasSetter)) {
                        attrs = {};

                        for (var i = 0; i < node.attributes.length; i++) {
                            var attr = node.attributes[i].nodeName;

                            if (attr === strs.template) {
                                while (node.lastChild) {
                                    node.removeChild(node.lastChild);
                                }

                                node.appendChild(doc.createTextNode(Template.replace(node.attributes[i].nodeValue)));
                            } else if (attr.slice(0, strs.setAttributePrefix.length) === strs.setAttributePrefix) {
                                attrs[attr.slice(strs.setAttributePrefix.length)] = Template.replace(node.attributes[i].nodeValue);
                            }
                        }

                        for (var x in attrs) {
                            node.setAttribute(x, attrs[x]);
                        }
                    }

                    if (node.hasAttribute(strs.hasConstruct)) {
                        Template.contract(node);
                    }
                }

                // move down first, then across

                if (node.firstChild) {
                    node = node.firstChild;
                } else {
                    while (true) {
                        // visit on the way up

                        if (node.nodeType === 1 && node.hasAttribute(strs.hasConstruct)) {
                            Template.expand(node, model);
                        }

                        if (node === el || node.nextSibling) {
                            break;
                        } else {
                            node = node.parentNode;
                        }
                    }

                    if (node === el) {
                        break;
                    } else {
                        node = node.nextSibling;
                    }
                }
            }

            this.stack.pop();
            if (!this.stack.length) {
                this.stack = null;
            }

            return el;
        },

        replace: function(template) {
            var stack = this.stack;

            if (template.indexOf('[') === -1) {
                return get(stack, template, '');
            }

            return template.replace(/\[([^\]]+)\]/g, function(tag, name) {
                return get(stack, name, '');
            });
        },

        expandIterateOver: function(html, node, model) {
            if (!model) {
                return;
            }
            if (model.models) {
                model = model.models;
            }
            if (!model.length) {
                return;
            }

            var doc = node.ownerDocument,
                frag = doc.createDocumentFragment();

            for (var i = 0; i < model.length; i++) {
                frag.appendChild(this.render(vivify(html, doc), model[i]));
            }

            node.parentNode.insertBefore(frag, node);
        },

        expandIfEmpty: function(html, node, model) {
            if (model && (model.models || model.length) && (!model.models || model.models.length)) {
                return;
            }

            node.parentNode.insertBefore(this.render(vivify(html, node.ownerDocument), model), node);
        },

        expandIfNonEmpty: function(html, node, model) {
            if (!model) {
                return;
            }
            if (model.models) {
                model = model.models;
            }
            if (!model.length) {
                return;
            }

            node.parentNode.insertBefore(this.render(vivify(html, node.ownerDocument), model), node);
        },

        expandIf: function(html, node, model) {
            if (!model) {
                return;
            }

            node.parentNode.insertBefore(this.render(vivify(html, node.ownerDocument), model), node);
        },

        expandIfNot: function(html, node, model) {
            if (model) {
                return;
            }

            node.parentNode.insertBefore(this.render(vivify(html, node.ownerDocument), model), node);
        },

        contract: function(el) {
            if (el.jquery) {
                el = el[0];
            }

            for (var node = el.firstChild; node; node = node.nextSibling) {
                if (node.nodeType !== 8) {
                    continue;
                }

                if (node.nodeValue.slice(0, strs.beginMagic.length) !== strs.beginMagic) {
                    continue;
                }

                while (node.nextSibling.nodeType !== 8 || node.nextSibling.nodeValue !== strs.endMagic) {
                    el.removeChild(node.nextSibling);
                }
            }
        },

        expand: function(el) {
            if (el.jquery) {
                el = el[0];
            }

            for (var node = el.firstChild; node; node = node.nextSibling) {
                if (node.nodeType !== 8) {
                    continue;
                }

                var content = node.nodeValue;

                if (content.slice(0, strs.beginMagic.length) !== strs.beginMagic) {
                    continue;
                }

                var space1 = content.indexOf(' ', strs.beginMagic.length),
                    space2 = content.indexOf(' ', space1 + 1),
                    attr = content.slice(strs.beginMagic.length, space1),
                    field = content.slice(space1 + 1, space2);

                content = unescape(content.slice(space2 + 1));

                this[strs.constructs[attr]](content, node = node.nextSibling, get(this.stack, field));
            }
        }
    };
    return Template;
});
