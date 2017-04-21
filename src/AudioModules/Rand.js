Modules.Rand = class Rand extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Rand";

		this.numberOfInputs	= 1;
		this.numberOfOutputs= 1;
		this.color			= 5; 
		this.width			= 30; 
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
		if (!this.inputs[0]) return this.sample;
		this.sample = (this.inputs[0].module.run(t, 1, this.inputs[0].index) > 0.9)? Math.random() : this.sample;
		return this.sample;
	}
}