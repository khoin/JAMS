Modules.Note2Freq = class Note2Freq extends AudioModule {
	constructor		(con) {
		super(con);

		this.className 		= "Note2Freq";
		this.numberOfInputs = 1;
		this.numberOfOutputs= 1;
		this.color 			= 130; 
		this.width 			= 60; 
		this.height 		= 15;
		this.name 			= "number";

		this.params[0] = {
			name : "Tuning",
			type : "number",
			value : 440
		}
		this.params[1] = {
			name : "transpose",
			type : "number",
			value : 0
		}
		this.params[2] = {
			name : "edo",
			type : "number",
			value : 12
		}
	}

	interface		(g, args) {
		g.text(4, 4, "NOTE2FREQ" );
	}

	run				(t, z, a) {
		if(this.inputs[0] == undefined) return [0,0];
		return [Math.pow(2, ( ~~this.getInput(0, t, 1)[0] + this.params[1].value - 69 ) / this.params[2].value) * this.params[0].value, 0];
	}
}