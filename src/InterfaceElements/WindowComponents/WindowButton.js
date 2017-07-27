class WindowButton extends InterfaceWindowComponent {
	constructor		(con = {}) {
		super(con);
		this.content	= con.content || "";
		this.fontSize	= con.fontSize || 1;
		this.fontColor	= con.fontColor|| "#fff";
		this.callback	= con.callback || (z => {});

		let dimensions	= Graphics.textSize(this.content, this.fontSize);
		this.w 			= dimensions[0] + 5;
		this.h			= dimensions[1] + 5;

		this.isHovered	= false;
	}

	eMouseDown		(x, y) {
		this.callback();
	}

	eMouseOut		(e) {
		this.isHovered = false;
	}

	eMouseMove		(e) {
		this.isHovered = true;
	}

	render			(g, w, h) {
		if (this.isHovered) {
			g.context.fillStyle = "#fff";
			g.context.fillRect(0, 0, w, h);
			g.setColor(0);
			g.text(3, 3, this.content, this.fontSize);
		} else {
			g.setColor(1);
			g.text(3, 3, this.content, this.fontSize);
			g.box(0, 0, w, h);
		}
	}
}