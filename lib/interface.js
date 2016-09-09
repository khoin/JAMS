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

	function resizeWindow(e) { 
		if( _.currentWindow.width +e.movementX > 150 ) _.currentWindow.width += e.movementX;
		if( _.currentWindow.height+e.movementY > 80 ) _.currentWindow.height += e.movementY;
	}

	var blocking = false;
	this.windows.some( (win,index) => { 
		if( x > win.x  && x < win.x + win.width && y > win.y-9 && y < win.y + win.height ) {
			_.currentWindow = win;
			if( y < win.y && x < win.x + win.width - 8 ) dom.addEventListener("mousemove", moveWindow);
			if( y > win.y + win.height - 8 && x > win.x + win.width - 8 && win.resizable ) dom.addEventListener("mousemove", resizeWindow);
			dom.addEventListener("mouseup", () => {
				dom.removeEventListener("mousemove", moveWindow);
				dom.removeEventListener("mousemove", resizeWindow);
			});

			//close window
			if( y < win.y && x >= win.x + win.width - 8 ) {
				_.windows.splice(index, 1);
				win.children.forEach( child => {
					if(child.onClose) child.onClose();
				});
			}

			// window's childrens
			win.children.some( child => {
				if(!child.handleClick || !child._offsetData) return;
				let o = Interface.calculateNodeOffset(win, child);
				let gx = win.x + o.ox + child._offsetData.ix * win.width;
				let gy = win.y + o.oy + child._offsetData.iy * win.height;
				if( x > gx && x < gx + child.calcWidth(win.width, win.height) &&
					y > gy && y < gy + child.calcHeight(win.width, win.height) ) {
					child.handleClick(x-gx, y-gy);
					return true;
				}
			});

			blocking=true;
			return true;
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
		// resize
		if(win.resizable) _.ctx.line(win.x+win.width-5, win.y+ win.height, win.x + win.width, win.y + win.height -5);
		
		_.ctx.context.fillStyle = "#fff";
		// does this window have babies? if so, render its nodes.
		if ( win.children instanceof Array ) {
			let ix = 0;
			let ly = 0;
			let iy = 0;
			win.children.forEach(node => { 
				// update
				if( !node._offsetData ) {
					node._offsetData = {};
					ix = node._offsetData.ix = (ix + node.config.width > 1)? 0 : ix;
					iy = node._offsetData.iy = (ix === 0)? ly + iy : iy;
					ly = (ix === 0)? node.config.height : Math.max(node.config.height, ly);
				}
				
				// calc local/global offsets 
				let o = Interface.calculateNodeOffset(win, node);
				let gx = (o.ox + win.x + node._offsetData.ix*win.width) |0;
				let gy = (o.oy + win.y + node._offsetData.iy*win.height)|0;
				//render borders if enabled
				if(win.renderBorders) 
					_.ctx.box(  (win.x + node._offsetData.ix * win.width) |0, 
								(win.y + node._offsetData.iy * win.height)|0, 
								(node.config.width * win.width)|0, 
								(node.config.height*win.height)|0 );

				_.ctx.context.save();
				_.ctx.context.translate( gx, gy );
						try { 
							node.render(_.ctx , x-gx, y-gy, {winWidth: win.width, winHeight: win.height}); 
						} 
						catch(e) { _.ctx.context.fillStyle="#f50"; _.ctx.text(0,0, "Error." + e.message, 1); console.error(e); }
				_.ctx.context.restore();

				//update ix again
				ix = (ix + node.config.width > 1)? 0 : ix + node.config.width;
			})
		}

	});
}

Interface.calculateNodeOffset = function(win, node) {
	return {
		ox: (node.config.xAnchor == "center")? (win.width/2 *node.config.width -node.calcWidth( win.width, win.height) /2) : 0,
		oy: (node.config.yAnchor == "center")? (win.height/2*node.config.height-node.calcHeight( win.width, win.height)/2) : 0
	}
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
		width: config.width  || 150,
		height:config.height || 80,
		x: config.x, y: config.y,
		resizable: (config.resizable !== undefined)? config.resizable : true,
		renderBorders: (config.renderBorders !== undefined)? config.renderBorders : false,
		children: config.children
	}
	this.windows.push(win);
	return win;
}

/**
----Interface nodes
**/
// -----
Interface.ArrayNode = function(config) {
	if( !(this instanceof Interface.ArrayNode)) return new Interface.ArrayNode(config);
	this.config = config;
	this.config.xAnchor = (this.config.xAnchor == undefined)? "center" : this.config.xAnchor;
	this.config.yAnchor = (this.config.yAnchor == undefined)? "center" : this.config.yAnchor;
}
Interface.ArrayNode.prototype.calcHeight = function(w,h) {
	return 14;
}
Interface.ArrayNode.prototype.calcWidth = function(w,h) {
	if(!this.config.getValue) return 14;
	return 14*Math.max(4,this.config.getValue().length);
}
Interface.ArrayNode.prototype.render = function(ctx) { 
	if(!this.config.getValue || !(this.config.getValue() instanceof Uint8Array) ) return; 
	this.config.getValue().forEach( (item,i) => {
		ctx.box(i*14, 0, 14, 14);
		ctx.text(2+i*14, 5, item);
	})
}

//----
Interface.TextNode = function(config) {
	if( !(this instanceof Interface.TextNode)) return new Interface.TextNode(config);
	this.config = config;
	this.config.fontSize = (this.config.fontSize == undefined)? 1: this.config.fontSize;
	this.config.xAnchor = (this.config.xAnchor == undefined)? "center" : this.config.xAnchor;
	this.config.yAnchor = (this.config.yAnchor == undefined)? "center" : this.config.yAnchor;
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

//----
Interface.NumberNode = function(config) {
	if(!(this instanceof Interface.NumberNode)) return new Interface.NumberNode(config);
	this.config = config;
	this.config.xAnchor = (this.config.xAnchor == undefined)? "center" : this.config.xAnchor;
	this.config.yAnchor = (this.config.yAnchor == undefined)? "center" : this.config.yAnchor;
	this.keyboardListening = false;
	this.inputBuffer = "";
	this.inputListener = this.handleKeyDown.bind(this);
	this.absoluteWidth = this.absoluteHeight = 0;
}
Interface.NumberNode.prototype.calcHeight = function() {
	return 8;
}
Interface.NumberNode.prototype.calcWidth = function(w,h) {
	return this.absoluteWidth = this.config.width*w*0.75;
}
Interface.NumberNode.prototype.onClose = function() {
	this.keyboardListening = false; 
	document.removeEventListener("keydown", this.inputListener);
}

Interface.NumberNode.prototype.handleClick = function(x,y) { 
	if( !this.config.getValue || !this.config.setValue ) {return;}
	if( x>0 && x<8 ) {
		this.config.setValue( parseFloat(this.config.getValue()-1) );
		return;
	}
	if( x>this.absoluteWidth-8 && x<this.absoluteWidth ) {
		this.config.setValue( parseFloat(this.config.getValue()+1) );
		return;
	}
	if( x>8 && x<this.absoluteWidth-8 ) {
		this.inputBuffer = "";
		if( this.keyboardListening = !this.keyboardListening ) { 
			document.addEventListener("keydown", this.inputListener);
		} else {
			document.removeEventListener("keydown", this.inputListener);
		}
		return;
	}
}

Interface.NumberNode.prototype.handleKeyDown = function(e) { 
	var c, acceptedChars = "1234567890.-".split(""); 
	if(e.key == "Enter") { this.config.setValue( parseFloat( this.inputBuffer) ); this.onClose(); }
	if(e.key == "Backspace") this.inputBuffer = this.inputBuffer.substr(0, this.inputBuffer.length-1);
	if(-1 !== (c = acceptedChars.indexOf(e.key)) ) {
		this.inputBuffer += acceptedChars[c];
	}
}

Interface.NumberNode.prototype.render = function(ctx, x, y) {
	ctx.context.fillStyle = "#fff";
	ctx.box(0,0,8,8);
	if( x>0 && x<8 && y>0 && y<8 )   { ctx.context.fillRect(0,0,8,8) ; ctx.context.fillStyle = "#000"; }
	ctx.text(3,2,"-");
	ctx.context.fillStyle = "#fff";
	ctx.box(this.absoluteWidth-8,0,8,8);
	if( x>this.absoluteWidth-8 && x<this.absoluteWidth && y>0 && y<8 ) { ctx.context.fillRect(this.absoluteWidth-8,0,8,8); ctx.context.fillStyle = "#000"; }
	ctx.text(this.absoluteWidth-5,2,"+");
	ctx.context.fillStyle = "#fff";
	ctx.box(8,0,this.absoluteWidth-16,8);
	if( this.keyboardListening ) { 
		ctx.context.fillRect(8,0,this.absoluteWidth-16,8); ctx.context.fillStyle = "#000"; 
		ctx.text(11,2, (this.inputBuffer.length > (this.absoluteWidth-16)/4)? ".."+this.inputBuffer.substr(-~~((this.absoluteWidth-24)/4) ) : this.inputBuffer );
	} else {
		var displayingText = (this.config.getValue)? Math.round(this.config.getValue()*10000)/10000 : NaN;
		displayingText = displayingText.toString();
		ctx.text(11,2,(displayingText.length > (this.absoluteWidth-16)/4)? ".."+displayingText.substr(-~~((this.absoluteWidth-24)/4) ) : displayingText );	
	}
}

// ----
Interface.TextFieldNode = function(config) {
	if(!(this instanceof Interface.TextFieldNode)) return new Interface.TextFieldNode(config);
	this.config = config;
	this.config.xAnchor = (this.config.xAnchor == undefined)? "center" : this.config.xAnchor;
	this.config.yAnchor = (this.config.yAnchor == undefined)? "center" : this.config.yAnchor;
	this.keyboardListening = false;
	this.inputBuffer = "";
	this.inputListener = this.handleKeyDown.bind(this);
}
Interface.TextFieldNode.prototype.calcHeight = function() {
	return (this.keyboardListening)? Math.min(4,this.inputBuffer.split("\n").length) * 8 : 8;
}
Interface.TextFieldNode.prototype.calcWidth = function() {
	return 56;
}
Interface.TextFieldNode.prototype.onClose = function() {
	this.keyboardListening = false; 
	document.removeEventListener("keydown", this.inputListener);
}

Interface.TextFieldNode.prototype.getContent = function() { return this.inputBuffer; }

Interface.TextFieldNode.prototype.handleClick = function(x,y) {
	if( !this.config.getValue || !this.config.setValue ) {return;}
	if( x>8 && x<48 ) {
		this.inputBuffer = this.config.getValue();
		if( this.keyboardListening = !this.keyboardListening ) { 
			document.addEventListener("keydown", this.inputListener);
		} else {
			document.removeEventListener("keydown", this.inputListener);
		}
		return;
	}
}

Interface.TextFieldNode.prototype.handleKeyDown = function(e) { 
	e.preventDefault();
	var c, acceptedChars = "abcdefghijklmnopqrstuvwxyz1234567890.,+-*/=!? ".split(""); 
	if(e.key == "Enter" && e.shiftKey == true ) { this.inputBuffer += "\n"; return;}
	if(e.key == "Enter") { this.config.setValue( this.inputBuffer ); this.onClose(); }
	if(e.key == "Backspace") this.inputBuffer = this.inputBuffer.substr(0, this.inputBuffer.length-1);
	if(-1 !== (c = acceptedChars.indexOf(e.key)) ) {
		this.inputBuffer += acceptedChars[c];
	}
}

Interface.TextFieldNode.prototype.render = function(ctx, x, y) {
	ctx.context.fillStyle = "#fff";
	if( this.keyboardListening ) { 
		ctx.box(0,0,56, Math.min(4, this.inputBuffer.split("\n").length) * 8 );
		var displayingText = this.inputBuffer.split("\n").slice(-4).map( txt => (txt.length>10)? ".."+txt.substr(-10) : txt ).join("\n");
		ctx.context.fillRect(0,0,56, Math.min(4, this.inputBuffer.split("\n").length) * 8); ctx.context.fillStyle = "#000"; 
		ctx.text(3,2, displayingText );
	} else {
		ctx.box(0,0,56, 8);
		ctx.text(3,2,
			(this.config.getValue)? 
				(this.config.getValue().split("\n").pop().length>10)? 
				".."+this.config.getValue().split("\n").pop().substr(-10) : this.config.getValue().split("\n").pop() 
			: "");	
	}
}
// ----
Interface.Button = function(config) {
	if(!(this instanceof Interface.Button)) return new Interface.Button(config);
	this.config = config;
	this.config.xAnchor = (this.config.xAnchor == undefined)? "center" : this.config.xAnchor;
	this.config.yAnchor = (this.config.yAnchor == undefined)? "center" : this.config.yAnchor;
}
Interface.Button.prototype.calcHeight = function() {
	return 11;
}
Interface.Button.prototype.calcWidth = function() {
	return 4 + this.config.content.toString().length*4;
}

Interface.Button.prototype.handleClick = function(x,y) {
	if( !this.config.onClick ) {return;}
	this.config.onClick();
}
Interface.Button.prototype.render = function(ctx, x, y) {
	ctx.box(0,0, 4 + this.config.content.toString().length*4, 11);
	if(y>0 && y<11 && x>0 && x < 4+ this.config.content.toString().length*4 ) {
		ctx.context.fillRect(0,0, 4 + this.config.content.toString().length*4, 11);
		ctx.context.fillStyle="#000";
	}
	ctx.text(3,3, this.config.content);
}