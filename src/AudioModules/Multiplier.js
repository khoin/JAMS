Modules.Multiplier = class Multiplier extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Multiplier";

		this.numberOfInputs	= 2;
		this.numberOfOutputs= 1;
		this.color			= 80; 
		this.width			= 30; 
		this.height			= 30;
		this.name			= "multiplier";
		this.helpText		=
`---- Multiplier ----
Multiplies two inputs together. 
Default signal for either input is zero.
`;
	}

	interface	(g) {
		g.text(13, 12, "*",2);
	}
	
	run			(t, z, a) {
		const input1 = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 0;
		const input2 = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
		return input1 * input2;
	}
}