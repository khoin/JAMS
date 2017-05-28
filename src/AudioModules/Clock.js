Modules.Clock = class Clock extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Clock";

		this.numberOfInputs = 0;
		this.numberOfOutputs= 2;
		this.color 			= 40; 
		this.width 			= 60; 
		this.height 		= 30;
		this.name 			= "clock";
		this.helpText		=
`---- Clock ----
Return times in seconds or pulses
`;

		this.params[0] = {
			name: "BPM",
			type: "number",
			value: 120
		}
	}

	interface	(g, args) {
		g.text(20, 5 , "SECOND");
		g.text(20, 18, "PULSES");
	}
	
	run			(t, z, a) {
		// 1/64
		return [t * (1-a) + ~~(t%(3.75/this.params[0].value) < 1/sampleRate) * a * 2, 0];
	}
}