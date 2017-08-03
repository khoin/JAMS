class WindowListOptions extends InterfaceWindowComponent {
	constructor		(con = {}) {
		super(con);

		this.w				= 3/4;
		this.h 				= 20;

		this.getValue		= con.getValue || (z => "");
		this.setValue		= con.setValue || (z => {});
		this.values 		= con.values || [];

		this.currentValue = this.values.indexOf(this.getValue());
		this.absW = 10;
	}

	eMouseDown		(x, y) {
		this.setValue(this.values[Math.floor(this.values.length*x/this.absW)]);
		this.currentValue = this.values.indexOf(this.getValue());
	}

	render			(g, w, h) {
		this.absW = w;
		g.setColor(1);
		g.box(0, 0, w, h);

		let width = w/this.values.length;
		for (let i = 0; i < this.values.length; i++) {
			let textW = Graphics.textSize(this.values[i].toString())[0];
			g.text((i*width)+(width-textW)/2, 6, this.values[i]);
			g.box(i*width, 0, width, h);
		}
		g.fillBox(this.currentValue*width, 0, width, h);

		g.setColor(0);
		let textW = Graphics.textSize(this.values[this.currentValue].toString())[0];
		g.text((this.currentValue*width)+(width-textW)/2, 6, this.values[this.currentValue]);

	}
}