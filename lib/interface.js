var Interface = function(ctx) {
	if ( !(this instanceof Interface) ) return new Interface(ctx);

	//Drawing context
	this.ctx = ctx;
	//
	this.windows = [];
	this.menus = [];
	this.currentWindow = undefined;

	//context Helpers
	this.cDepth = 0;
	this.cInd = 0;
}

Interface.prototype.handleClick = function(x, y, dom) {
	var _ = this;
	this.menus.forEach( (menu,index) => { 
		if(x > menu.x && x < menu.x+menu.width && y > menu.y && y < menu.y+menu.height) { 
			var ind = Math.floor( (y-menu.y) / (menu.height/menu.options.length) );
			if(menu.options[ind].callback) menu.options[ind].callback(menu.x, menu.y);
		}
	});
	//clear all ctx menus when clicked
	this.menus = [];

	function moveWindow(e) {
		_.currentWindow.x += e.movementX;
		_.currentWindow.y += e.movementY;
	}

	var blocking = false;
	this.windows.some( (win,index) => {
		if( x > win.x  && x < win.x + win.width && y > win.y-9 && y < win.y + win.height ) {
			_.currentWindow = win;
			if( y < win.y && x < win.x + win.width - 8  ) dom.addEventListener("mousemove", moveWindow);
			if( y < win.y && x >= win.x + win.width - 8 ) _.windows.splice(index, 1);
			dom.addEventListener("mouseup", () => {
				dom.removeEventListener("mousemove", moveWindow);
			})

			blocking=true;
		}
	});

	return blocking;
}

Interface.prototype.handleMove = function(x, y) { 
	var _ = this;

	for(let j=0; j<this.menus.length; j++) {
		let menu = this.menus[j];
		// walk though the menus and see if option has children, if it does? create a menu and and assign necessary propeties
		if(x > menu.x && x < menu.x+menu.width+3 && y > menu.y && y < menu.y+menu.height) { 
			let cInd = _.cInd = Math.floor( (y-menu.y) / (menu.height/menu.options.length) );
			let cDepth =_.cDepth = ~~menu.depth;
			if( menu.options[cInd].children instanceof Array && menu.options[cInd].childrenCreated !== true) {
				let m = _.createContextMenu(menu.x + menu.width, menu.y + cInd*(menu.height/menu.options.length), menu.style, menu.options[cInd].children );
				m.depth = ~~menu.depth + 1;
				m.parentsIndex = cInd;
				m.parent = menu;
				menu.options[cInd].childrenCreated = true;
			}
			
		}
		// delete menus that aren't...like... under the parent (being hovered)
		if( ~~menu.depth > _.cDepth && menu.parentsIndex !== _.cInd) { 
			_.menus[j].parent.options[_.menus[j].parentsIndex].childrenCreated = false;
			_.menus.splice(j,1);
		}
		
	}
}

Interface.prototype.render = function(x, y) {
	var _ = this;

	// render Context Menus
	this.menus.forEach(menu => {
		_.ctx.context.strokeStyle = "#fff";
		_.ctx.box(menu.x, menu.y, menu.width, menu.height );
		_.ctx.context.fillStyle = `hsla(${~~menu.depth*60}, 100%, 50%, 1)`;
		_.ctx.context.fillRect(menu.x+1, menu.y+1, menu.width-1, menu.height-1);

		var optionHeight = menu.height/menu.options.length;
		
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
			
			//children indicator
			if( opt.children instanceof Array) 
				_.ctx.line(menu.x + menu.width - 4, menu.y + (index+1)*(optionHeight), menu.x + menu.width, menu.y + (index+1)*(optionHeight) -4);

			_.ctx.context.fillStyle = "#fff";
			_.ctx.line(menu.x, menu.y + index*optionHeight, menu.x + menu.width, menu.y + index*optionHeight);
		});
		
	});

	//Render windows
	this.windows.forEach( win => {
		_.ctx.context.strokeStyle = "#fff";
		_.ctx.context.fillStyle = "#000";
		_.ctx.box(win.x, win.y, win.width, win.height);
		_.ctx.context.fillRect(win.x+1, win.y-9, win.width-1, win.height+9);
		_.ctx.context.fillStyle = "#fff";
		// title box
		_.ctx.box(win.x, win.y-9, win.width, 9);
		_.ctx.text(win.x+2, win.y-7, win.title);
		// close button
		_.ctx.box(win.x+win.width-8, win.y-9, 8, 9);
		if( x > win.x + win.width - 8 && x < win.x + win.width && y > win.y - 8 && y < win.y ) {
			_.ctx.context.fillStyle = "#fff";
			_.ctx.context.fillRect(win.x+win.width-8, win.y-9, 8, 9);
			_.ctx.context.fillStyle = "#000";
			_.ctx.text(win.x+win.width-5, win.y-7, "x");
		}
		_.ctx.text(win.x+win.width-5, win.y-7, "x");
		_.ctx.context.fillStyle = "#fff";

		// does this window have babies?
		if ( win.children instanceof Array ) {
			win.children.forEach(node => {
				let nx = (node.config.xAnchor == "center")? win.width/2 *node.config.width -node.calcWidth() /2 : 0;
				let ny = (node.config.yAnchor == "center")? win.height/2*node.config.height-node.calcHeight()/2 : 0;
				_.ctx.context.save();
				_.ctx.context.translate(nx + win.x, ny + win.y);
					node.render(_.ctx);
				_.ctx.context.restore();
			})
		}

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

Interface.prototype.createWindow = function(config) {
	var win = {
		title: config.title,
		width: config.width,
		height:config.height,
		x: config.x, y: config.y,
		children: config.children
	}
	this.windows.push(win);
	return win;
}

//----
Interface.TextNode = function(config) {
	if( !(this instanceof Interface.TextNode)) return new Interface.TextNode(config);
	this.config = config;
}

Interface.TextNode.prototype.calcHeight = function() {
	return this.config.content.split("\n").length*6*this.config.fontSize;
}
Interface.TextNode.prototype.calcWidth = function() {
	return this.config.content.split("\n").map(a => a.length).reduce( (a,b) => Math.max(a, b))*4*this.config.fontSize;
}

Interface.TextNode.prototype.render = function(ctx) {
	ctx.text(0,0, this.config.content, this.config.fontSize);
}
