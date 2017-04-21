Modules.Output = class JAMSOutput extends AudioModule {
	constructor		(con) {
		super(con);

		this.className			= "Output";

		this.numberOfInputs		= 2;
		this.numberOfOutputs	= 0;
		this.color				= 10;
		this.width				= 30;
		this.height				= 30;
		this.name				= "OUT";
	}

	eConnect 		() {

	}

	interface		(g, args) {
		g.text(7, 11, this.name);
	}

	run				(t, z, a) {
		return (this.inputs[a])? this.inputs[a].module.run(t, z, this.inputs[a].index) : 0;
	}
}