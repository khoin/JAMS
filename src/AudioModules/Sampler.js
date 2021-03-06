Modules.Sampler = class Sampler extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Sampler";
		this.prerun	   = true;

		this.numberOfInputs	= 4;
		this.numberOfOutputs= 1;
		this.color			= 5; 
		this.width			= 80; 
		this.height			= 75;
		this.name			= "sampler";
		this.helpText		=
`---- Sampler ----
Basic WAV sampler. 
`;
		this.params[0] = {
			name: "WaveData",
			type: "wavefile",
			value: [new Float32Array(sampleRate), new Float32Array(sampleRate), sampleRate],
			onload: () => { 
				this.adjustedRate = this.params[0].value[2] / sampleRate;
				this.position = this.realPosition = 0;
				// calc peaks
				this.rms = new Float32Array(this.width);
				this.len = this.params[0].value[0].length;
				let chunk =  (this.len / (this.width * 32));

				for (let i = 0, j = 0; i < this.len; i += chunk, j++)
					this.rms[~~(j/32)] = 
						Math.max(this.rms[~~(j/32)], 
								~~( 15 * Math.sqrt((1/Math.max(1,chunk)) * 
									this.params[0].value[0]
										.slice(~~i, ~~(i+chunk))
										.map(x => x*x)
										.reduce((a,b) => a+b, 0))
									) 
								);
				

			},
			paramSave: () => {
				return WaveParamSave(this.params[0].value);
			},
			paramLoad: d => {
				return WaveParamLoad(d);
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

		this.rms = new Float32Array(this.width);
		this.len = sampleRate;

		this.position = 0;
		this.realPosition = 0;
		this.adjustedRate = this.params[0].value[2] / sampleRate;
	}

	eMouseDown	(x, y) { 
		if ( x > 40 && x < 80 && y < 15 )
			this.params[2].value = !this.params[2].value;
	}

	interface	(g) {
		g.box(40, 0, 40, 15);
		g.text(4, 5, "RATE");
		g.text(4, 20,"BEGN");
		g.text(4, 35,"END");
		g.text(4, 50,"TRIG");

		// wave
		for (let i = 0; i < this.rms.length; i++) 
			g.context.fillRect(i, 75-this.rms[i], 1, this.rms[i]);

		g.context.fillRect(~~(this.width*this.position/this.len), 60, 1, 15);
		
		if (this.params[2].value) {
			g.context.fillRect(40, 0, 40, 16);
			g.setColor(0)
			g.text(44, 5, "LOOP");
		} else {
			g.text(44, 5, "LOOP");
		}
	}

	clamp (x) {
		return Math.max(0, Math.min(x, 1));
	}
	
	run			(t, z, a) {
		const data = this.params[0].value;
		const l = data[0].length;

		const delta = (this.realPosition - this.position);
		if (z == 1)
			return [
				data[0][this.position] + delta * (data[0][(this.position + 1) % l] - data[0][this.position]) , 
				data[1][this.position] + delta * (data[1][(this.position + 1) % l] - data[1][this.position])
			];

		let speed	= this.getInput(0, t, 1)[0] !== 0? this.getInput(0, t, 1)[0] : this.params[1].value;
		let start	= this.getInput(1, t, 1)[0] !== 0? this.clamp( this.getInput(1, t, 1)[0] ) * l : 0;
		let end 	= this.getInput(2, t, 1)[0] !== 0? this.clamp( this.getInput(2, t, 1)[0] ) * l - 1 : l - 1;
		let trigger	= this.getInput(3, t, 1)[0] > 0.95;
		
		// trigger
		if (trigger) 
			return this.realPosition = this.position = start;

		// No Loop
		if (!this.params[2].value && ((speed > 0 && this.realPosition > end) || (speed < 0 && this.realPosition < start)) ) return;
		
		// Wrap
		if (this.realPosition < start) this.realPosition = end;
		if (this.realPosition > end) this.realPosition = start;

		this.realPosition = this.realPosition + this.adjustedRate * speed;

		this.position = ~~(this.realPosition) % l;
		
	}
}