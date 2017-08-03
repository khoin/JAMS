Modules.Switch = class Switch extends AudioModule {
	constructor		(con) {
		super(con);

		this.className 		= "Switch";
		this.numberOfInputs = 2;
		this.numberOfOutputs= 1;
		this.color 			= 2; 
		this.width 			= 48; 
		this.height 		= 30;
		this.name 			= "number";
		this.helpText =
`---- Switch ----
First input dictates the input to be routed.
`;
		
		this.params[0] = {
			name: "NumRoute",
			type: "number",
			_v: 1,
			text: "1",
			set value (x) {
				x = Math.max(1, x);
				this._v = x;
			},
			get value () { return this._v; }
		};
		this.currentInput = 0;

	}

	eDrag			(e) {
		this.params[0].value = this.params[0].value - e.movementY/10;
		this.numberOfInputs = ~~this.params[0].value + 1;
		this.height = 15*this.numberOfInputs;
		for (let i = this.numberOfInputs; i < this.inputs.length; i++)
			this.unsetInput(i);
	}

	interface		(g, args) {
		g.context.fillRect(0,15 * (this.currentInput+1), 15, 15);
		g.text(3, 4, "SW"+(this.numberOfInputs - 1)+"J");

		//this shouldn't be here... but...
		this.eDrag({movementY:0});
	}

	run				(t, z, a) {
		this.currentInput = this.getInput(0, t, 1)[0]? ~~Math.max(0, this.getInput(0, t, 1)[0]%(this.numberOfInputs-1) ) : 0;
		let output = this.getInput(1 + this.currentInput, t, 1);
		return [output[0], output[1]];
	}
}