class InterfaceMenuBar extends InterfaceElement {
	constructor (con) {
		super(con);
		this.x = 0;
		this.y = 0;
		this.h = 24;
		this.w = innerWidth;

		this.menus = con.menus;
		this.app = con.app;
		
		let prevX = 0;
		this.menus = this.menus.map( x => {
			x.x = prevX;
			x.w = Graphics.textSize(x.name)[0] + 16
			prevX += x.w;
			return x;
		});

		this.currentIndex = -1;
	}

	eMouseDown () {
		if (this.currentIndex !== -1) this.menus[this.currentIndex].callback(this.parent, this.app, this.menus[this.currentIndex].x);
	}

	eMouseMove (e, x, y) {
		if (y > 24) return;

		for (let i = 0; i < this.menus.length ; i++) {
			if( this.menus[i].x + this.menus[i].w > x ) {
				this.currentIndex = i;
				break;
			}
			this.currentIndex = -1;
		}

	}

	render (g) {
		// Border
		g.setColor(8);
		g.fillBox(-1, -1, innerWidth+2, 24);
		g.setColor(1);
		g.box(-1, -1, innerWidth+2, 24);

		g.setColor(0);
		if (this.currentIndex !== -1) g.fillBox(this.menus[this.currentIndex].x , 0, this.menus[this.currentIndex].w, 23);

		g.setColor(1);		
		for (let i = 0 ; i < this.menus.length; i++) 
			g.text(8 + this.menus[i].x, 8, this.menus[i].name)	
	}
}