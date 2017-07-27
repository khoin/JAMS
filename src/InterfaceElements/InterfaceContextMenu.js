class InterfaceContextMenu extends InterfaceElement {
	constructor			(con) {
		super(con);

		this.padding 	= 3;
		this.top 		= InterfaceContextMenu.preCalc(con.options, true, this.padding);

		this.w 			= this.top.width;
		this.h			= this.top.height;

		// highlighter
		this.currentOption = undefined;

		return this;
	}

	static preCalc		(input, visible = false, padding = 3) {
		let output = {
			visible: visible,
			width: 0,
			height: 0,
			children: []
		};

		for (let i = 0; i < input.length; i++) {
			let option = input[i];
				option.text = option.text.toUpperCase();
			let textSize = Graphics.textSize(option.text);

			output.width = Math.max(output.width, textSize[0] + padding*2);
			output.height += textSize[1] + padding*2;

			let child = {
				parent: output,
				text: option.text,
				callback: option.callback,
				children: (option.children)? this.preCalc(option.children, false, padding) : undefined
			};

			if (child.children) child.children.parent = child;

			output.children.push(child);
		}

		return output;
	}

	getOptionFromMouse	(node, x, y, x0 = 0) {
		if (!node.visible || x < 0 || y < 0) return undefined;

		let boxHeight = this.padding * 2 + Graphics.textSize("A")[1];
		let index = Math.floor(y / boxHeight);

		if (x < node.width && node.children[index]) {
			return node.children[index];
		} else { 
			let o = undefined;
			for (let i = 0; !o && i < node.children.length; i++)
				if (node.children[i].children)
					o = this.getOptionFromMouse(node.children[i].children, x - node.width, y - i * boxHeight, x0 + node.width);
			return o;
		}
	}

	// Calculate entire menus' total widths and height from an option
	menuSizeFromOption	(node, width = 0, height = 0) {
		let boxHeight = this.padding * 2 + Graphics.textSize("A")[1];
		if (node !== this.top)
			return this.menuSizeFromOption(node.parent, width + ~~node.width, height + ~~node.height);
		else 
			return [width + node.width, height + node.height];
	}

	eMouseDown			(x, y) {
		this.currentOption = this.getOptionFromMouse(this.top, x, y);
		
		if(this.currentOption && this.currentOption.callback) {
			this.currentOption.callback();
			this.eUnfocus();
		}

	}

	eUnfocus			() {
		this.parent.remove(this);
	}

	eMouseMove			(e) { 
		const	x = e.clientX - this.x,
				y = e.clientY - this.y;

		this.w = this.top.width;
		this.h = this.top.height;

		this.currentOption = this.getOptionFromMouse(this.top, x, y);
		
		if(this.currentOption) { 
			const menuSize = this.menuSizeFromOption(this.currentOption);
			this.w = menuSize[0];
			this.h = menuSize[1];

			// clear lower level nodes that aren't hovered
			for(let option of this.currentOption.parent.children)
				if (option.children)
					option.children.visible = false;

			if (this.currentOption.children) { 
				this.currentOption.children.visible = true;
			}
		}
	}

	renderNode			(g, node, depth = 0) {
		const boxHeight = this.padding * 2 + Graphics.textSize("A")[1];

		g.context.fillStyle = `hsl(${depth*20}, 60%, 35%)`;
		g.context.fillRect(0, 0, node.width , node.height);
		
		let y = 0;
		for (let i = 0; i < node.children.length; i++) {
			let child = node.children[i];

			if (this.currentOption == child) {
				g.context.fillStyle = `hsl(${depth*20}, 30%, 50%)`;
				g.context.fillRect(0, i*boxHeight, node.width, boxHeight);
			}

			g.setColor(1);
			g.box(0, y, node.width, boxHeight);
			g.text(this.padding, y + this.padding, child.text);

			if (child.children)  {
				g.line(node.width - 5, y + boxHeight, node.width , y + boxHeight - 5);
	
				if (child.children && child.children.visible) {
					g.context.save();
					g.context.translate(node.width, boxHeight*i);
						// recurse
						this.renderNode(g, child.children, depth + 1);
					g.context.restore();
				}
			}

			y += boxHeight;
		}
	}

	render				(g) {
		g.context.save();
		g.context.translate(this.x, this.y);
			this.renderNode(g, this.top);
		g.context.restore();
	}
}