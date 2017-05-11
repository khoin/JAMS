class AudioModule {
	constructor	(con) {
		// meta & desktop
		this.id 				= con.id;
		this.x					= con.x;
		this.y					= con.y;
		this.numberOfInputs		= 0;
		this.numberOfOutputs	= 0;
		this.color				= 0;
		this.width				= 30;
		this.height				= 30;
		this.name				= "defaultName";
		this.helpText			= "No Helptext Available";

		// dsp & midi
		this.inputs				= [];
		this.params 			= [];
		this.prerun				= false; // If true, module will be triggered to run BEFORE output.run is pulled.
		this.midiRequest		= true;
		this.midiParam 			= 0; // the index of the param that midi will write over

	}

	interface	(g, args) {}

	eDrag		(e) {}

	eMouseDown	(x, y) {}

	// index, time, calc or not, dV
	getInput	(i, t, z, defaultValue = 0) {
		return (this.inputs[i])? this.inputs[i].module.run(t, z, this.inputs[i].index) : [defaultValue, defaultValue];
	}

	setParam	(index, val) {
		this.params[index].value = val;
		return this;
	}

	connect		(destinationNode, destinationIndex, originIndex) {
		destinationNode.inputs[destinationIndex] = {};
		let destinationInput		= destinationNode.inputs[destinationIndex];

		destinationInput.id 		= this.id;
		destinationInput.module		= this;
		destinationInput.index		= originIndex; // origin output index
		destinationNode.eConnect();
		return this;
	}

	eConnect	() {}

	unsetInput	(index) {
		delete this.inputs[index];
		return this;
	}

	run 		(t, z, a) {
		// t : time
		// z : should the module return its previous calculated value? 1: yes, 0: no
		// a : output index
	}

}

let Modules = {};
