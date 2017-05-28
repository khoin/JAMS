Modules.Sequencer16 = class Sequencer16 extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Sequencer16";
		this.prerun		= true;

		this.numberOfInputs	= 1;
		this.numberOfOutputs= 1;
		this.color			= 70; 
		this.width			= 60; 
		this.height			= 75;
		this.name			= "seq16";
		this.helpText		=
`---- Sequencer16 ----
A Sequencer16
`;
		this.params[0] 		= {
			name: "Data",
			type: "array",
			value: new Float32Array(16)
		}
		this.position		= 0;
		this.currentPosition= 0;
	}

	eMouseDown	(x, y) {
		this.currentPosition= ~~(x/15) + 4 * ~~(y/15);
	}

	eDrag		(e, x, y) {
		this.params[0].value[this.currentPosition] -= e.movementY / 7;
	}

	interface	(g) {
		// numbers
		for (let i = 0; i < 16; i++) 
			g.text(8 - (Graphics.textSize(""+(~~this.params[0].value[i]))[0]/2) + 15 * (i%4), 5 + 15 * ~~(i/4), ~~this.params[0].value[i])
		// lines
		for (let i = 1; i < 4; i++) {
			g.line(0, 15 * i, this.width, 15 * i);
			g.line(15 * i, 0, 15 * i, this.height - 15);
		}
		// and everything nice
		g.context.fillRect(this.position%4 * 15, ~~(this.position/4) * 15, 15, 15);
		g.line(0, 60, this.width, 60);
		g.text(5, this.height - 10, "SEQ16");

		g.context.fillStyle = "#000";
		g.text(	8 - (Graphics.textSize(""+(~~this.params[0].value[this.position]))[0]/2) + 15 * (this.position%4), 
				5 + 15 * ~~(this.position/4), 
				~~this.params[0].value[this.position])
	}
	
	run			(t, z, a) {
		if (!this.inputs[0]) return [this.params[0].value[0], 0];
		if (z == 1) return [~~this.params[0].value[this.position], 0];
		this.position = (this.getInput(0, t, 1)[0] > 0.9)? (this.position + 1)%16 : this.position;
	}
}