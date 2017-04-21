Modules.Remainder = class Remainder extends AudioModule {
	constructor		(con) {
		super(con);

		this.className = "Remainder";

		this.numberOfInputs = 2;
		this.numberOfOutputs= 1;
		this.color 			= 180; 
		this.width 			= 30; 
		this.height 		= 30;
		this.name 			= "remainder";
		this.helpText =
`---- Remainder ----
Returns the remainder after dividing the 
first input by the second input.

E.g: 10 % 4 = 2;
`;
		
	}

	interface		(g, args) {
		g.text(11, 8, "%", 2);
	}

	run				(t, z, a) {
		let input1 = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 0;
		let input2 = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
		return input1 % input2;
	}
}