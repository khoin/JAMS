Modules.SineOSC = class SineOSC extends AudioModule {
	constructor		(con) {
		super(con);

		this.className 			= "SineOSC";
		this.prerun				= true;

		this.numberOfInputs 	= 2;
		this.numberOfOutputs	= 1;
		this.color				= 100;
		this.width 				= 30;
		this.height 			= 30;
		this.name 				= "SINE OSC";
		this.helpText			=
`---- SineGenerator ----
* 1st Input : Frequency 
* 2nd Input : Phase 

---- *** Tips *** ----
Input another signal into the 2nd input
to create Phase Modulation.
`;
		
		this.lastSample			= 0;
	}

	interface		(g, args) {
		let portSize = args.portSize;
		let anchor   = portSize/2 - 3;
		g.text(3, anchor, "FREQ");
		g.text(3, anchor + portSize, "PHAS");
	}

	run				(t, z, a) {
		if( z == 1 ) return this.lastSample;
		var pm = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
		var f  = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 440;
		return this.lastSample = Math.sin( Math.PI*2*f*t + pm );
	}
}