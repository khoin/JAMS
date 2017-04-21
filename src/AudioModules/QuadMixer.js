Modules.QuadMixer = class QuadMixer extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "QuadMixer";
		this.prerun	   = true;

		this.numberOfInputs	= 4;
		this.numberOfOutputs= 1;
		this.color			= 55; 
		this.width			= 30; 
		this.height			= 60;
		this.name			= "quadmixer";
		this.helpText		=
`---- QuadMixer ----
Mixes 4 inputs.
Temporary Mixer that deals with that stereo bullshit.
`;
		this.channels 		= new Float32Array(4);
		this.iter 			= true;
		this.params[0] = {
			name: "Stereo Out",
			type: "boolean",
			value: false
		}
	}

	interface	(g) {
		g.text(11, 13, "Q\nU\nA\nD",1);
	}
	
	run			(t, z, a) {
		if (this.params[0].value) this.iter = !this.iter;
		if (this.iter) {
			this.channels[0] = (this.inputs[0])? this.inputs[0].module.run(t, 0, this.inputs[0].index)/4 : 0;
			this.channels[1] = (this.inputs[1])? this.inputs[1].module.run(t, 0, this.inputs[1].index)/4 : 0;
			this.channels[2] = (this.inputs[2])? this.inputs[2].module.run(t, 0, this.inputs[2].index)/4 : 0;
			this.channels[3] = (this.inputs[3])? this.inputs[3].module.run(t, 0, this.inputs[3].index)/4 : 0;
		}
		return this.channels[0] + this.channels[1] + this.channels[2] + this.channels[3];
	}
}