class WindowText extends InterfaceWindowComponent {
	constructor		(con = {}) {
		super(con);
		this.content	= con.content || "";
		this.fontSize	= con.fontSize || 1;
		this.fontColor	= con.fontColor|| 1;

		let dimensions	= Graphics.textSize(this.content, this.fontSize);
		this.w 			= dimensions[0];
		this.h			= dimensions[1];

		this.border		= false;
	}

	render			(g, w, h) {
		g.setColor(this.fontColor);
		g.text(0, 0, this.content, this.fontSize);
		if (this.border)
			g.box(-2, -2, this.w + 2, this.h + 3);
	}
}