Modules.MidiKeyboard = class MidiKeyboard extends AudioModule {
	constructor		(con) {
		super(con);

		this.midiRequest = true;
		this.midiParam = 0;

		this.className 		= "MidiKeyboard";
		this.numberOfInputs = 0;
		this.numberOfOutputs= 3;
		this.color 			= 2; 
		this.width 			= 40; 
		this.height 		= 45;
		this.name 			= "midiin";
		
		this.params[0] = {
			name: "mididata",
			type: "no-user-access",
			value: new Uint8Array([144,69,12])
		}
		this.params[1] = {
			name: "channel",
			type: "number",
			value: 1
		}

		this.runningValues = [0,0,0];
	}

	setParam (index, value) {
		this.params[index].value = value;
		if( index !== 0 ) return this;
		//on
		if(value[0] == (143 + this.params[1].value)) { 
			this.runningValues[0] = 1; 
			this.runningValues[1] = value[1]; 
			this.runningValues[2] = value[2]/127; 
		}
		//off
		if(value[0] == (127 + this.params[1].value) && this.runningValues[1] == value[1])
			this.runningValues[0] = 0;
		return this;
	}

	interface		(g, args) {
		g.text(4,5,"GATE");
		g.text(4,20,"NOTE");
		g.text(4,34,"VELO");
	}

	run				(t, z, a) {
		var outputValues = this.runningValues.slice();
		return [outputValues[a],outputValues[a]];
	}
}