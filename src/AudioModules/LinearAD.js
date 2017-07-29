Modules.LinearAD = class LinearAD extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "LinearAD";

		this.numberOfInputs	= 3;
		this.numberOfOutputs= 1;
		this.color			= 6; 
		this.width			= 45; 
		this.height			= 45;
		this.name			= "linearad";

		this.lastT = 0;
		this.value = 0;
		this.phase = 0;
	}

	interface	(g) {
		if (this.phase == 1) {
			g.point2(42 - 22*this.value, (1 - this.value) * 41 ,4);
		} else {
			g.point2(22*this.value, (1 - this.value) * 41 ,4);
		}
		g.line(0, 44, 22, 0);
		g.line(22, 0, 44, 44);
	}
	
	run			(t, z, a) {
		this.lastT = (this.getInput(0, t, 1)[0] > 0.5)? t : this.lastT;
		const curr = t - this.lastT;
		let attack = this.getInput(1, t, 1)[0] !== 0? this.getInput(1, t, 1)[0] : 0.010;
		let decay  = this.getInput(2, t, 1)[0] !== 0? this.getInput(2, t, 1)[0] : 0.400;

		if (curr <= attack) {
			this.value = (1/attack)*curr;
			this.phase = 0;
		} else {
			this.value = 1 - (curr-attack)/decay;
			this.phase = 1;
		}
		this.value = Math.max(0, Math.min(1, this.value));

		return [this.value, this.value];
	}
}