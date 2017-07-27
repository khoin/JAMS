Modules.QuadMixer = class QuadMixer extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "QuadMixer";
		this.prerun	   = true;

		this.numberOfInputs	= 4;
		this.numberOfOutputs= 1;
		this.color			= 3; 
		this.width			= 32; 
		this.height			= 60;
		this.name			= "quadmixer";
		this.helpText		=
`---- QuadMixer ----
Mixes 4 inputs.
Temporary Mixer that deals with that stereo bullshit.
`;
		this.lchannels 		= new Float32Array(4);
		this.rchannels 		= new Float32Array(4);
		this.iter 			= true;
	}

	interface	(g) {
		g.text(12, 13, "Q\nU\nA\nD",1);
	}
	
	run			(t, z, a) {
		const c1 = this.getInput(0, t, 1);
		const c2 = this.getInput(1, t, 1);
		const c3 = this.getInput(2, t, 1);
		const c4 = this.getInput(3, t, 1);

		this.lchannels[0] = c1[0]/4;
		this.lchannels[1] = c2[0]/4;
		this.lchannels[2] = c3[0]/4;
		this.lchannels[3] = c4[0]/4;

		this.rchannels[0] = c1[1]/4;
		this.rchannels[1] = c2[1]/4;
		this.rchannels[2] = c3[1]/4;
		this.rchannels[3] = c4[1]/4;
		
		return [this.lchannels[0] + this.lchannels[1] + this.lchannels[2] + this.lchannels[3],
		this.rchannels[0] + this.rchannels[1] + this.rchannels[2] + this.rchannels[3]];
	}
}