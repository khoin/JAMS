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
		const input1 = this.getInput(0, t, 1);
		const input2 = this.getInput(1, t, 1);
		return [input1[0] * input2[0], input1[1] * input2[1]];
	}
}