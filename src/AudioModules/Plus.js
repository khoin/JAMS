Modules.Plus = class Plus extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Plus";

		this.numberOfInputs	= 2;
		this.numberOfOutputs= 1;
		this.color			= 330; 
		this.width			= 30; 
		this.height			= 30;
		this.name			= "plus";
		this.helpText		=
`---- Plus ----
Adds the two inputs together.
Can act as a mixer.
`;
	}

	interface	(g) {
		g.text(11, 11, "+",2);
	}
	
	run			(t, z, a) {
		const input1 = this.getInput(0, t, 1);
		const input2 = this.getInput(1, t, 1);
		return [input1[0] + input2[0], input1[1] + input2[1]];
	}
}