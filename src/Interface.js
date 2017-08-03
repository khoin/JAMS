class Interface {
	constructor	(Graphics) {
		this.g = Graphics;
		this.elementList = [];

		this.sXY = 1;
	}

	add	(element) {
		if (!(element instanceof InterfaceElement)) throw new Error("Not an InterfaceElement");
		this.elementList.unshift(element);
		element.parent = this;
		return this;
	}

	remove (element) {
		for ( let i = 0; i < this.elementList.length; i++ )
			if (element == this.elementList[i])
				this.elementList.splice(i, 1);
		return this;
	}

	removeByName (name) {
		for ( let i = 0; i < this.elementList.length; i++ )
			if (name == this.elementList[i].name)
				this.elementList.splice(i, 1);
	}

	isOnElement	(el, x, y) {
		return x > el.x && x < el.x + el.w && y > el.y && y < el.y + el.h;
	}

	eMouseDown (e) {
		let x = e.clientX, 
			y = e.clientY;

		let isOnElement = false;

		for ( let i = 0; i < this.elementList.length; i++ ) {
			const el = this.elementList[i];
			if ( isOnElement = this.isOnElement(el, x, y) && !el.bypassMouseDown) {
				// Put to index zero.
				this.elementList.unshift(this.elementList.splice(i, 1)[0]);
				el.eMouseDown(x - el.x, y - el.y);
				break;
			}
			el.eUnfocus();
		}

		return !isOnElement; //isBlocking == true
	}

	eMouseUp (e) {
		for ( let i = 0; i < this.elementList.length; i++ )
			this.elementList[i].eMouseUp(e);
	}

	eMouseMove (e) {
		const x = e.clientX;
		const y = e.clientY;
		this.g.DOMElement.style.cursor = "auto";
		for ( let i = 0; i < this.elementList.length; i++ ) 
			this.elementList[i].eMouseMove(e, x, y);
	}

	eKeyDown (e) {
		for ( let i = 0; i < this.elementList.length; i++ )
			this.elementList[i].eKeyDown(e);
	}

	render () {
		for ( let i = this.elementList.length - 1; i >= 0; i-- )
			this.elementList[i].render(this.g);
	}
}

class InterfaceElement {
	constructor	(con = {}) {
		this.name 				= con.name || "SuperElement";
		this.parent 			= undefined;
		this.bypassMouseDown	= false;

		this.x	= con.x || 10;
		this.y	= con.y || 10;
		this.w	= con.w || 300;
		this.h	= con.h || 300;
	}

	eMouseDown	(x, y) {}
	eKeyDown	(e) {}
	eUnfocus	(e) {}
	eMouseUp	(e) {}
	eMouseMove	(e, x, y) {}
	render		(g) {}
}