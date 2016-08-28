var Interface = function(ctx) {
	if ( !(this instanceof Interface) ) return new Interface(ctx);

	//Drawing context
	this.ctx = ctx;
	//
	this.windows = [];
	this.menus = [];
}

Interface.prototype.render = function() {

}

Interface.prototype.createMenu = function(x, y, w, h) {
	var menu = {
		width: w || 100,
		height: h || 300,
		x: x,
		y: y
	}
	this.menus.push(menu);
	return menu;
}