Modules.Number = class Number extends AudioModule {
	constructor		(con) {
		super(con);

		this.className 		= "Number";
		this.numberOfInputs = 0;
		this.numberOfOutputs= 1;
		this.color 			= 170; 
		this.width 			= 60; 
		this.height 		= 15;
		this.name 			= "number";
		this.helpText =
`---- Number ----
Returns the number displayed.
Shift + Drag this number to change
its value. 
The Sensitivity of the drag can be altered
through the Parameters window.
`;
		
		this.params[0] = {
			name: "Value",
			type: "number",
			_v: 1,
			text: "1",
			set value (x) {
				this._v = x;
				this.text = Math.round(this._v*10000)/10000;
				this.text = this.text.toString();
			},
			get value () { return this._v; }
		};
		this.params[1] = {
			name: "Drag Sensitivity",
			type: "number",
			value: 200
		}

	}

	eDrag			(e) {
		this.params[0].value = this.params[0].value - e.movementY/this.params[1].value;
		
	}

	interface		(g, args) {
		let text = this.params[0].text;
		g.text(4, 4, (text.length > 8)? ".." + text.substr(0,8) : text );
	}

	run				(t, z, a) {
		return [this.params[0]._v, 0];
	}
}