class WindowIntegerSlider extends InterfaceWindowComponent {
	constructor		(con = {}) {
		super(con);

		this.w				= 3/4;
		this.h 				= 20;

		this.getValue		= con.getValue || (z => "");
		this.setValue		= con.setValue || (z => {});
		this.min 			= con.min || 1;
		this.max 			= con.max || 10;
		this.step			= con.step || 1;

		this.displayedValue = Math.max(this.min, Math.min(this.max, parseInt(this.getValue())));
		this.absW = 10;
		this.isDragging = false;
	}

	eMouseDown		(x, y) {
		this.isDragging = true;
		this.displayedValue = this.min+Math.round((this.max-this.min)*(1/this.step)*x/this.absW)/(1/this.step);
		this.setValue(parseInt(this.displayedValue));
	}

	eMouseUp		(x, y) {
		this.isDragging = false;
		this.setValue(parseInt(this.displayedValue));
	}

	eMouseMove		(x, y) {
		if (this.isDragging)
			this.displayedValue = this.min+Math.round((this.max-this.min)*(1/this.step)*x/this.absW)/(1/this.step);
	}

	render			(g, w, h) {
		this.absW = w;
		g.setColor(1);
		g.box(0, 15, w, 1);

		let x = (this.displayedValue-this.min)/(this.max-this.min)*w;
		g.box(x, 10, 4, 10);

		g.text(x-1, 0, this.displayedValue);
	}
}