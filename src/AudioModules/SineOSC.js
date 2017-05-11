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
		this.phase 				= 0;
	}

	interface		(g, args) {
		let portSize = args.portSize;
		let anchor   = portSize/2 - 3;
		g.text(3, anchor, "FREQ");
		g.text(3, anchor + portSize, "PHAS");
	}

	run				(t, z, a) {
		if( z == 1 ) return [this.lastSample, this.lastSample];
		const pm = this.getInput(1, t, 1)[0]; 
		const f  = this.getInput(0, t, 1, 440)[0];
		this.lastSample = Math.sin( Math.PI*2*(this.phase += f/sampleRate) + pm )
		return [this.lastSample, this.lastSample];
	}
}