Modules.Readout = class Readout extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Readout";
		this.prerun    = true;

		this.numberOfInputs	= 1;
		this.numberOfOutputs= 0;
		this.color			= 1; 
		this.width			= 72; 
		this.height			= 15;
		this.name			= "Readout";


		this.value = 0;
	}

	interface	(g, args) {
		g.text(4,4, this.value.toString().substr(0,7));
	}
	
	run			(t, z, a) {
		if(!this.inputs[0]) return;
		this.value = this.getInput(0, t, 1)[0];
	}
}