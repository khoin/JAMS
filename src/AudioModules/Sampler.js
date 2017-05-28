Modules.Sampler = class Sampler extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Sampler";
		this.prerun	   = true;

		this.numberOfInputs	= 4;
		this.numberOfOutputs= 1;
		this.color			= 55; 
		this.width			= 60; 
		this.height			= 60;
		this.name			= "sampler";
		this.helpText		=
`---- Sampler ----
Basic WAV sampler. No interpolation.
`;
		this.params[0] = {
			name: "WaveData",
			type: "wavefile",
			value: [new Float32Array(sampleRate), new Float32Array(sampleRate), sampleRate],
			onload: () => {
				this.adjustedRate = this.params[0].value[2] / sampleRate;
				this.position = this.realPosition = 0;
			}
		};

		this.params[1] = {
			name: "speed",
			type: "number",
			value: 1
		}
		this.params[2] = {
			name: "loop",
			type: "boolean",
			value: true
		}

		this.position = 0;
		this.realPosition = 0;
		this.adjustedRate = this.params[0].value[2] / sampleRate;
	}

	eMouseDown	(x, y) { 
		if ( x > 30 && x < 60 && y < 15 )
			this.params[2].value = !this.params[2].value;
	}

	interface	(g) {
		g.box(30, 0, 30, 15);
		g.text(4, 5, "RATE");
		g.text(4, 20,"BEGN");
		g.text(4, 35,"END");
		g.text(4, 50,"TRIG");

		if (this.params[2].value) {
			g.context.fillRect(30, 0, 30, 15);
			g.context.fillStyle = "#000";
			g.text(34, 5, "LOOP");
		} else {
			g.text(34, 5, "LOOP");
		}

	}

	clamp (x) {
		return Math.max(0, Math.min(x, 1));
	}
	
	run			(t, z, a) {
		const data = this.params[0].value;
		const l = data[0].length;

		let speed	= this.getInput(0, t, 1)[0] !== 0 ? this.getInput(0, t, 1)[0] : this.params[1].value;
		let start	= this.clamp( this.getInput(1, t, 1)[0] );
		let end 	= this.getInput(2, t, 1)[0] !== 0 ? this.clamp( this.getInput(2, t, 1)[0] ) * l : l;
		let trigger	= this.getInput(3, t, 1)[0] > 0.9;
		
		const delta = (this.realPosition - this.position);
		if (z == 1)
			return [
				data[0][this.position] + delta * (data[0][(this.position + 1) % l] - data[0][this.position]) , 
				data[1][this.position] + delta * (data[1][(this.position + 1) % l] - data[1][this.position])
			];
		
		// No Loop
		if (!this.params[2].value && this.position > end - 1) return;

		// Wrap
		if (this.position < start) this.realPosition = end - 1;

		this.realPosition =
			(trigger || (speed > 0 && this.position > end) || (speed < 0 && this.position < end))? 
				(this.getInput(1, t, 1)[0]*data[0].length || 1) 
			: 
				(this.realPosition + this.adjustedRate * speed) % l;

		this.position = ~~(this.realPosition) % l;
		
	}
}