var Interface = function(ctx) {
	if ( !(this instanceof Interface) ) return new Interface(ctx);

	//Drawing context
	this.ctx = ctx;
	//
	this.windows = [];
	this.menus = [];
}

Interface.prototype.handleClick = function(x, y) {
	var _ = this;
	this.menus.forEach( (menu,index) => { 
		if(x > menu.x && x < menu.x+menu.width && y > menu.y && y < menu.y+menu.height) {
			var ind = Math.floor( (y-menu.y) / (5+menu.style.padding*2) );
			menu.options[ind].callback(menu.x, menu.y);
			
		}
		_.menus.splice(index,1);
	});
}

Interface.prototype.render = function(x, y) {
	var _ = this;
	this.menus.forEach(menu => {
		_.ctx.context.fillStyle = "#fff";
		_.ctx.box(menu.x, menu.y, menu.width, menu.height );
		_.ctx.context.fillStyle = "rgba(15,55,16,0.8)";
		_.ctx.context.fillRect(menu.x+1, menu.y+1, menu.width-1, menu.height-1);

		var optionHeight = (5+menu.style.padding*2);
		// each options
		menu.options.forEach( (opt, index) => { 
			var txtColor, bgColor;
			if( x > menu.x && x < menu.x + menu.width && y > menu.y + optionHeight*index && y < menu.y + optionHeight*(index+1) ) 
				{
					txtColor = "#000"; bgColor = "#fff";
				} else {
					txtColor = "#fff"; bgColor = "rgba(15,55,16,0.8)";
				}
				_.ctx.context.fillStyle = bgColor;
				_.ctx.context.fillRect(menu.x+1, menu.y+optionHeight*index, menu.width-1, optionHeight);
				_.ctx.context.fillStyle = txtColor;
				_.ctx.text(menu.x + menu.style.padding, menu.y + menu.style.padding + optionHeight*index, opt.text);
			
			_.ctx.context.fillStyle = "#fff";
			_.ctx.line(menu.x, menu.y + index*optionHeight, menu.x + menu.width, menu.y + index*optionHeight);
		});
		
	});
}

Interface.prototype.createContextMenu = function(x, y, style, opts) {
	var menu = {
		x: x,
		y: y,
		width: 4*opts.map(i=>i.text.length).reduce( (a,b) => Math.max(a,b) )-1 + style.padding*2,
		height: 5*opts.length + style.padding*opts.length*2,
		style: style,
		options: opts
	}
	this.menus.push(menu);
	return menu;
}
