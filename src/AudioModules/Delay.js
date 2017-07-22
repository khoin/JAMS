Modules.Delay = class Delay extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Delay";
		this.prerun    = true;

		this.numberOfInputs	= 2;
		this.numberOfOutputs= 1;
		this.color			= 130; 
		this.width			= 60; 
		this.height			= 30;
		this.name			= "Delay";
		this.helpText		= "";

		// const
		this.BUFFER_LENGTH = sampleRate/2;
		// internals
		this.pointer = 0;
		this.distance = 1000;

		this.buffer = [new Float32Array(this.BUFFER_LENGTH), new Float32Array(this.BUFFER_LENGTH)];

	}

	interface	(g, args) {
		let portSize = args.portSize;
		let anchor   = portSize/2 - 3;
		g.text(3, anchor, "INPUT");
		g.text(3, anchor + portSize, "LENGTH");
	}
	
	run			(t, z, a) {
		if (z == 1) 
			return [
				this.buffer[0][(this.pointer + this.distance) % this.BUFFER_LENGTH],
				this.buffer[1][(this.pointer + this.distance) % this.BUFFER_LENGTH]
			];


		let input = this.getInput(0, t, 1);
		this.distance = (this.getInput(1, t, 1))? ~~Math.max( 0 , Math.min(this.getInput(1, t, 1)[0], this.BUFFER_LENGTH) ) : 1000;

		this.buffer[0][this.pointer] = input[0];
		this.buffer[1][this.pointer] = input[1];

		if (--this.pointer < 0) this.pointer = this.BUFFER_LENGTH - 1;
	}
}