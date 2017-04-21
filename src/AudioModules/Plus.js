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
		const input1 = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 0;
		const input2 = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
		return input1 + input2;
	}
}