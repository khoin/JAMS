// Thanks to Werner Van Belle from Bpmdj for the implementation of the flanger.
// https://werner.yellowcouch.org

Modules.Flange = class Flange extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Flange";
		this.prerun    = true;

		this.numberOfInputs	= 7;
		this.numberOfOutputs= 1;
		this.color			= 4; 
		this.width			= 72; 
		this.height			= 105;
		this.name			= "flange";
		this.helpText		= "";

		this.feedback = 0.8;
		this.dry 	  = 0.5;
		this.wet 	  = 0.5;

		// const
		this.BUFFER_LENGTH = 2048;
		// internals
		this.isForward = true;
		this.step	= 0.005;
		this.pointer= 0;
		this.D 		= 0;
		this.minD	= 100;
		this.maxD 	= 512;

		this.buffer = [new Float32Array(this.BUFFER_LENGTH + 1), new Float32Array(this.BUFFER_LENGTH + 1)];

	}

	interface	(g, args) {
		let portSize = args.portSize;
		let anchor   = portSize/2 - 3;
		g.text(3, anchor, "INPUT");
		g.text(3, anchor + portSize, "MIN");
		g.text(3, anchor + portSize*2, "MAX");
		g.text(3, anchor + portSize*3, "SPEED");
		g.text(3, anchor + portSize*4, "FEEDBCK");
		g.text(3, anchor + portSize*5, "DRY");
		g.text(3, anchor + portSize*6, "WET");
		g.context.fillRect(64, 0, 1, 105);
		g.context.fillRect(64, ~~(105*this.minD/this.BUFFER_LENGTH), 8, 1);
		g.context.fillRect(64, ~~(105*this.maxD/this.BUFFER_LENGTH), 8, 1);
		g.context.fillRect(64, ~~(105*this.D/this.BUFFER_LENGTH), 8, 1);
	}
	
	run			(t, z, a) {
		let input = this.getInput(0, t, 1);
		this.minD = this.getInput(1, t, 1)[0]? Math.min(this.maxD, Math.max(0, this.getInput(1, t, 1)[0])) : 100;
		this.maxD = this.getInput(2, t, 1)[0]? Math.min(2048, Math.max(this.minD, this.getInput(2, t, 1)[0])) : 512;
		this.step = this.getInput(3, t, 1)[0]? Math.max(0, this.getInput(3, t, 1)[0]/1000) : 0.005;
		this.feedback = this.getInput(4, t, 1)[0]? Math.min(0.99, Math.max(0, this.getInput(4, t, 1)[0])) : 0.8;
		this.dry = this.getInput(5, t, 1)[0]? Math.min(1, Math.max(0, this.getInput(5, t, 1)[0])) : 0.5;
		this.wet = this.getInput(6, t, 1)[0]? Math.min(1, Math.max(0, this.getInput(6, t, 1)[0])) : 0.5;

		if (this.isForward)
			this.D += this.step;
		else
			this.D -= this.step;
		
		this.isForward = this.D > this.maxD? false : this.D < this.minD? true : this.isForward;

		let d1 = parseInt(this.D),
			d2 = d1 + 1,
			v  = this.D - d1;

		let oldLeft1 = this.buffer[0][(this.pointer + d1) % this.BUFFER_LENGTH],
			oldLeft  = oldLeft1 + v * (this.buffer[0][(this.pointer + d2) % this.BUFFER_LENGTH] - oldLeft1);
		let oldRight1= this.buffer[1][(this.pointer + d1) % this.BUFFER_LENGTH],
			oldRight = oldRight1 + v * (this.buffer[1][(this.pointer + d2) % this.BUFFER_LENGTH] - oldRight1);

		let processed = [
			input[0] + this.feedback * oldLeft,
			input[1] + this.feedback * oldRight
		];

		this.buffer[0][this.pointer] = processed[0];
		this.buffer[1][this.pointer] = processed[1];
		if (--this.pointer < 0) this.pointer = this.BUFFER_LENGTH;

		return [
			processed[0] * this.dry + oldLeft * this.wet,
			processed[1] * this.dry + oldRight * this.wet
		];
	}
}