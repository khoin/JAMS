Modules.Rand = class Rand extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Rand";

		this.numberOfInputs	= 1;
		this.numberOfOutputs= 1;
		this.color			= 3; 
		this.width			= 32; 
		this.height			= 15;
		this.name			= "linear decay";
		this.helpText		=
`---- Rand ----
Generates Random 0-1 by pulse 
`;
		this.sample = 0;
	}

	interface	(g) {
		var pos = this.width * this.sample
		g.line(pos, 1, pos, this.height+1);
	}
	
	run			(t, z, a) {
		if (!this.inputs[0]) return [this.sample, 0];
		this.sample = (this.getInput(0, t, 1)[0] > 0.9)? Math.random() : this.sample;
		return [this.sample, 0];
	}
}
