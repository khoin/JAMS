Modules.Output = class JAMSOutput extends AudioModule {
	constructor		(con) {
		super(con);

		this.className			= "Output";

		this.numberOfInputs		= 1;
		this.numberOfOutputs	= 0;
		this.color				= 6;
		this.width				= 32;
		this.height				= 15;
		this.name				= "OUT";
	}

	eConnect 		() {

	}

	interface		(g, args) {
		g.text(4, 4, this.name);
	}

	run				(t, z, a) {
		let out = this.getInput(0, t, 1);
		return [out[0], out[1]];
	}
}