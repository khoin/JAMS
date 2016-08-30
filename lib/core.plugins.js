// Super Class ---
var EmsysModule = function(config) {
	if( !(this instanceof EmsysModule)) return new EmsysModule(config);
	
	// ID, UI stuff
	this.id = config.id;
	this.x					= config.x; 
	this.y 					= config.y;
	this.numberOfInputs 	= 0;
	this.numberOfOutputs 	= 0;
	this.color 				= 0; 
	this.width 				= 50
	this.height 			= 20;
	this.name 				= "defaultName";

	this.prerun = false;
	this.inputs = [];
	this.params = [];

}

EmsysModule.prototype.interface = function() {}
EmsysModule.prototype.handleDrag = function() {}
EmsysModule.prototype.run = function() {}
EmsysModule.prototype.setParam = function(index, value) {
	this.params[index] = value;
	return this;
}
EmsysModule.prototype.setInput = function(node, index, originIndex, id) {
	this.inputs[index] = {};
	this.inputs[index].id = id;
	this.inputs[index].module = node;
	this.inputs[index].index = originIndex;
	return this;
}
EmsysModule.prototype.unsetInput = function(index) {
	delete this.inputs[index];
	return this;
}
EmsysModule.prototype.connect = function(node, index, originIndex) { 
	node.setInput(this, index, originIndex, this.id);
	return this;
}

//--------------
// one input.
var EmsysOutput = function(config) {
	EmsysModule.call(this, config);

	this.className = "EmsysOutput";

	this.numberOfInputs = 1;
	this.numberOfOutputs= 0;
	this.color			= 25;
	this.width			= 50;
	this.height			= 20;
	this.name 	= "output";

}
EmsysOutput.prototype = Object.create(EmsysModule.prototype);

EmsysOutput.prototype.interface = function(ui, uiVars) {
	ui.text(this.x + uiVars.ioWidth + 8, this.y + 7, this.name);
}
EmsysOutput.prototype.run = function(t, z) { 
	return (this.inputs[0])? this.inputs[0].module.run(t, z, this.inputs.index) : 0 ;
}

//----------
// input0: frequency
// input1: phase

var EmsysSineGenerator = function(config) {
	EmsysModule.call(this, config);

	this.className = "EmsysSineGenerator";
		
	this.prerun			= true;
	this.numberOfInputs	= 2;
	this.numberOfOutputs= 1;
	this.color 			= 100;
	this.width 			= 100;
	this.height 		= 40;
	this.name 			= "sine osc";

	// need dis
	this.lastSample = 0;
}

EmsysSineGenerator.prototype = Object.create(EmsysModule.prototype);
EmsysSineGenerator.prototype.interface = function(ui, uiVars) {
	ui.text(this.x + uiVars.ioWidth + 2, this.y+2, this.name);
}
EmsysSineGenerator.prototype.run = function(t, z, outputIndex) {
	if( z == 1 ) return this.lastSample;
	var pm = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
	var f  = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 440;
	return this.lastSample = Math.sin( Math.PI*2*f*t + pm );
};

//---------
// Product of the two inputs is the output.
var EmsysMultiplier = function(config) {
	EmsysModule.call(this, config);
	
	this.className = "EmsysMultiplier";

	this.numberOfInputs = 2;
	this.numberOfOutputs= 1;
	this.color 			= 80; 
	this.width 			= 57; 
	this.height 		= 40;
	this.name 			= "multiplier";
}

EmsysMultiplier.prototype = Object.create(EmsysModule.prototype);
EmsysMultiplier.prototype.interface = function(ui, uiVars) {
	ui.text(this.x + uiVars.ioWidth + 17, this.y + 17, "*",2);
}
EmsysMultiplier.prototype.run = function (t, z) {
	var input1 = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 0;
	var input2 = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
	return input1 * input2;
}

// ----
// Returns a number.
// Param0 = number itself
// Param1 = Sensitivity of the dragging
var EmsysNumber = function(id) {
	EmsysModule.call(this, id);

	this.className = "EmsysNumber";

	this.numberOfInputs = 0;
	this.numberOfOutputs= 1;
	this.color 			= 170; 
	this.width 			= 50; 
	this.height 		= 20;
	this.name 			= "number";

	this.params[0] = 1;
	this.params[1] = 5;
}
EmsysNumber.prototype = Object.create(EmsysModule.prototype);
EmsysNumber.prototype.interface = function(ui, uiVars) {
	ui.text( this.x + uiVars.ioWidth + 2, this.y + 7, Math.round(this.params[0]*100)/100 ) ;
}
EmsysNumber.prototype.run = function (t,z) {
	return this.params[0];
}
EmsysNumber.prototype.handleDrag = function(e) {
	this.params[0] -= e.movementY/this.params[1];
}
//---