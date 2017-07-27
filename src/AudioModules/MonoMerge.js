Modules.MonoMerge = class MonoMerge extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "MonoMerge";

		this.numberOfInputs	= 2;
		this.numberOfOutputs= 1;
		this.color			= 70; 
		this.width			= 16; 
		this.height			= 30;
		this.name			= "multiplier";
		this.helpText		=
`---- MonoMerge ----
Merge Two Mono Signals together. 
Take Left channels.
`;
	}

	interface	(g) {
		g.text(5, 5, "L");
		g.text(5, 19, "R");
	}
	
	run			(t, z, a) {
		const input1 = this.getInput(0, t, 1);
		const input2 = this.getInput(1, t, 1);
		return [input1[0], input2[0]];
	}
}