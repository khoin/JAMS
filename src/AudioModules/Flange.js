// Thanks to Werner Van Belle from Bpmdj for the implementation of the flanger.
// https://werner.yellowcouch.org

Modules.Flange = class Flange extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Flange";
		this.prerun    = true;

		this.numberOfInputs	= 1;
		this.numberOfOutputs= 1;
		this.color			= 30; 
		this.width			= 30; 
		this.height			= 30;
		this.name			= "flange";
		this.helpText		= "";

		this.feedback = 0.8;
		this.dry 	  = 0.5;
		this.wet 	  = 0.5;

		// const
		this.BUFFER_LENGTH = 4095;
		// internals
		this.isForward = true;
		this.step	= 0.002;
		this.pointer= 0;
		this.D 		= 0;
		this.minD	= 20;
		this.maxD 	= 1000;

		this.buffer = [new Float32Array(this.BUFFER_LENGTH + 1), new Float32Array(this.BUFFER_LENGTH + 1)];

	}

	interface	(g, args) {
	
	}
	
	run			(t, z, a) {
		let input = this.getInput(0, t, 1);

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