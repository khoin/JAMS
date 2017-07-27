class WindowPalette extends InterfaceWindowComponent {
	constructor		(con = {}) {
		super(con);

		this.w				= 1;
		this.h 				= 10;

		this.palette = con.palette instanceof Array? con.palette : ["#000"];
	}

	render			(g, w, h) {
		let w_ = w / this.palette.length;
		for (let i = 0; i < this.palette.length; i++) {
			g.context.fillStyle = this.palette[i];
			g.context.fillRect(1+w_*i, 0, w_, h);
		}
	}
}