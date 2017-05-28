class InterfaceWindow extends InterfaceElement {
	constructor		(con) {
		super(con);

		this.title		= con.title || "WINDOW TITLE";
		this.children	= [];

		//properties
		this.isResizable = con.isResizable || false;

		// states
		this.onCloseBox = false;
		this.onResize	= false;
		this.isDragging	= false;
		this.isResizing = false;

		return this;
	}

	appendChild		(component) {
		if(!(component instanceof InterfaceWindowComponent)) throw new TypeError("Must add only InterfaceWindowComponents");
		this.children.push(component);
		return this;
	}

	isOnComponent	(com, x, y) {
		return x > com._absX && x < com._absX + com._absW && y > com._absY && y < com._absY + com._absH;
	}

	close 			() {
		this.parent.remove(this)
	}

	eMouseDown		(x, y) {
		// titty bar
		if (y < 20) {
			// close btn
			if (x > this.w - 20) {
				this.parent.g.DOMElement.style.cursor = "auto";
				this.close();
			}
			this.isDragging = true;
		}

		if ( x > this.w - 15 && y > this.h - 15 && this.isResizable)
			this.isResizing = true;

		// components
		for (let i = 0; i < this.children.length; i++) {
			let el = this.children[i];
			if (this.isOnComponent(el, x, y))
				el.eMouseDown(x - el._absX, y - el._absY);
			else
				el.eUnfocus();
		}

	}

	eUnfocus		() {
	}

	eMouseMove		(e) {
		const x = e.clientX - this.x, y = e.clientY - this.y;

		this.onCloseBox = (x > this.w - 20 && x < this.w && y > 0 && y < 20);
		this.onResize = ( x > this.w - 15 && x < this.w + 3 && y > this.h - 15 && y < this.h + 3);
		
		if (this.onCloseBox) 
			this.parent.g.DOMElement.style.cursor = "pointer";
		if (this.onResize && this.isResizable) 
			this.parent.g.DOMElement.style.cursor = "se-resize";

		if (this.isResizing) {
			this.w += (this.w + e.movementX > 70) * e.movementX;
			this.h += (this.h + e.movementY > 70) * e.movementY;
		}

		if (this.isDragging) {
			this.x += e.movementX;
			this.y += e.movementY;
		}

		// components
		for (let i = 0; i < this.children.length; i++) {
			let el = this.children[i];
			if (this.isOnComponent(el, x, y))
				el.eMouseMove(x - el._absX, y - el._absY);
			else
				el.eMouseOut();
		}
	}

	eMouseUp		() {
		this.isDragging = this.isResizing = false;
	}

	eKeyDown		(e) { 
		for (let i = 0; i < this.children.length; i++)
			this.children[i].eKeyDown(e);
	}

	render			(g) {

		// switch to window's reference frame
		g.context.save();
		g.context.translate(this.x, this.y);

		g.context.fillStyle 	= "#000";
		g.context.fillRect(0, 0, this.w, this.h);

		g.context.strokeStyle 	= "#fff";
		g.context.fillStyle 	= "#fff";
		g.box	(0		, 0	, this.w	, this.h);
		// Title Box
		g.context.lineWidth = 1;
		g.context.save();
		g.context.beginPath();
		g.context.rect(1, 1, this.w-1, 20);
		g.context.clip();
			g.box	(0		, 0	, this.w	, 20);
			g.text	(7,  7, this.title, 1);
		g.context.restore();
		// Close Box
		g.context.fillStyle 	= (this.onCloseBox)? "#f44" : "#d33";
		g.context.fillRect	(this.w - 20	, 0	, 20	, 20);
		g.context.fillStyle 	= "#fff";
		g.box				(this.w - 20	, 0	, 20	, 20);
		// Resize
		if (this.isResizable) 
			g.line ( this.w - 10, this.h, this.w , this.h - 10)

		//Rendering Children
		/***
			+--------------+-------+
			|              |       |
			|      cw      |       |
			|   +------+   |       |
			|   |child |ch |wh     |
			|   +------+   |       |
			|   wrapper    |       |
			+--------------+       |
			|   child.ww           |
			<-------------->       |
			|                      |
			|       window         |
			+----------------------+
			        this.w
			<---------------------->
		***/
		g.context.save();
		g.context.beginPath();
		g.context.rect(0, 0, this.w-1, this.h-1);
		g.context.clip();

		let offsetX = 0,
			offsetY = 0,
			currentRowHeight = 0;
		for (let i = 0; i < this.children.length; i++) {
			const 	child = this.children[i];
			const 	cw = child.w,
					ch = child.h,
					ww = child.ww * this.w,
					wh = child.wh;

			if (offsetX + ww > this.w) {
				offsetX = 0;
				offsetY = offsetY + currentRowHeight;
				currentRowHeight = 0;
			}
			// Calculate (0, 0) position for components.
			// w,h <= 1 : assume it's a ratio; otherwise, pixel.
			let compXAnchor	= (cw > 1)? (ww-cw)/2 : (ww * (1-cw))/2;
			let compYAnchor = (ch > 1)? (wh-ch)/2 : (wh * (1-ch))/2 ;

			child._absX = ~~(offsetX + compXAnchor);
			child._absY = ~~(20 + offsetY + compYAnchor);
			child._absW = (cw > 1)? cw : ww * cw;
			child._absH = (ch > 1)? ch : wh * ch;
			g.context.save();
			//g.box(0offsetX, 20 + offsetY, ww, wh);
			g.context.translate(child._absX, child._absY);
				child.render(g, child._absW, child._absH);
			g.context.restore();

			currentRowHeight = Math.max(currentRowHeight, wh);
			offsetX += ww;

		}

		g.context.restore();
		g.context.restore();
	}
}

/**
	InterfaceWindowComponent:
	* InterfaceWindowComponents do not have relative position by default. 
	* Components must provide dimensions (w, h).
		If the width or height is <= 1, it is assumed as ratio.
	* User instantiating Components must provide the ratio of the width of the
		component versus the width of the container/wrapper (sx) (e.g. InterfaceWindow).
	* User don't need to provide the ratio of heights.
		Usually, it does not make sense to have elements scaled to height ratios.
		They must, however, provide it in number of pixels.
	* InterfaceElements which are able to take InterfaceWindowComponents as children
		can refer to the user-provided ratio to render appropriately. That is,
		using Component's dimension to set (0, 0) to where Component renders itself.
		And if the user provided a relative position, the Element renders as said.

	* Subclasses should be named in the form Window[Name]. E.g.: WindowText
**/

class InterfaceWindowComponent {
	constructor		(con = {}) {
		this.parent		= undefined;

		this.w	= 30;
		this.h  = 10;
		this.ww	= con.ww || 1;
		this.wh = con.wh || 10;
	}

	eMouseDown		(x, y) {}
	eUnfocus		(e) {}
	eMouseUp		(e) {}
	eMouseMove		(x, y) {}
	eMouseOut		() {}
	eKeyDown		(e) {}
	render			(g) {}
}
