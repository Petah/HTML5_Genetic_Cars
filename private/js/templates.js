var templates = {
	'health-bar': '<div class="health"><div class="health-bar"></div></div>',
	'mini-map-marker': '<div class="mini-map-marker"></div>'
};

function template(name) {
	var node = document.createElement('div');
	node.innerHTML = templates[name];
	return node.firstChild;
};
