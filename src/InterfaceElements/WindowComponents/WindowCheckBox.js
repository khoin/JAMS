class WindowCheckBox extends InterfaceWindowComponent {
	constructor		(con = {}) {
		super(con);

		this.w				= 10;
		this.h 				= 10;

		this.getValue		= con.getValue || (z => false);
		this.setValue		= con.setValue || (z => {});

		this.value 			= this.getValue();
	}

	eMouseDown		(x, y) {
		this.value = !this.value;
		this.setValue(this.value);
	}

	render			(g, w, h) {
		g.context.fillStyle = g.context.strokeStyle = "#fff";
		g.box(0, 0, 10, 10);
		if(this.value) g.context.fillRect(0, 0, 10 , 10);

	}
}