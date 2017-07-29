Modules.Remainder = class Remainder extends AudioModule {
	constructor		(con) {
		super(con);

		this.className = "Remainder";

		this.numberOfInputs = 2;
		this.numberOfOutputs= 1;
		this.color 			= 3; 
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
		g.text(12, 12, "%", 1);
	}

	run				(t, z, a) {
		const input1 = this.getInput(0, t, 1);
		const input2 = this.getInput(1, t, 1);
		return [input1[0] % input2[0], input1[1] % input2[1]];
	}
}