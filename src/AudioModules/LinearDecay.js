Modules.LinearDecay = class LinearDecay extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "LinearDecay";

		this.numberOfInputs	= 2;
		this.numberOfOutputs= 1;
		this.color			= 37; 
		this.width			= 30; 
		this.height			= 30;
		this.name			= "linear decay";
		this.helpText		=
`---- LinearDecay ----
A linear decay. 
`;
		this.position = 0;
		this.decayStep = 3/(sampleRate);
	}

	interface	(g) {
		let pos = (1 - this.position) * 26;
		g.point2(pos, pos, 4);
		g.line(0, 0, 30, 30);
	}
	
	run			(t, z, a) {
		if (!this.inputs[0]) return 0;
		this.position = (this.inputs[0].module.run(t, 1, this.inputs[0].index) > 0.9)? 1 : Math.max(0, this.position - this.decayStep);
		return this.position;
	}
}