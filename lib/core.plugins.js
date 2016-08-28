// Super Class ---
var EmsysModule = function(id) {
	if( !(this instanceof EmsysModule)) return new EmsysModule(id);
	this.id = id;
	this.inputs = [];
	this.params = [];
	this.info = {
		numberOfInputs: 0, numberOfOutputs: 0,
		color: 0, width: 50, height: 20, defaultName: "Module"
	}
}

EmsysModule.prototype.interface = function() {}
EmsysModule.prototype.handleDrag = function() {}
EmsysModule.prototype.run = function() {}
EmsysModule.prototype.setParam = function(index, value) {
	this.params[index] = value;
}
EmsysModule.prototype.setInput = function(node, index, originIndex, id) {
	this.inputs[index] = {};
	this.inputs[index].id = id;
	this.inputs[index].module = node;
	this.inputs[index].index = originIndex;
}
EmsysModule.prototype.unsetInput = function(index) {
	delete this.inputs[index];
}
EmsysModule.prototype.connect = function(node, index, originIndex) { 
	node.setInput(this, index, originIndex, this.id);
}



//--------------
// one input.
var EmsysOutput = function(id) {
	EmsysModule.call(this, id);
	this.info   = {
		numberOfInputs: 1,
		numberOfOutputs: 0,
		color: 25,
		width: 50,
		height: 20,
		defaultName: "output"
	}
}
EmsysOutput.prototype = Object.create(EmsysModule.prototype);

EmsysOutput.prototype.interface = function(ui, coord) {
	ui.text(coord.x+8, coord.y+7, this.info.defaultName);
}
EmsysOutput.prototype.run = function(t, z) { 
	return (this.inputs[0])? this.inputs[0].module.run(t, z, this.inputs.index) : 0 ;
}

//----------
// input0: frequency
// input1: phase

var EmsysSineGenerator = function(id) {
	EmsysModule.call(this, id);
	this.lastSample = 0;
	this.info = {
		requestPrerun: true,
		numberOfInputs: 2,
		numberOfOutputs: 1,
		color: 100,
		width: 100,
		height: 40,
		defaultName: "sine osc"
	}
}
EmsysSineGenerator.prototype = Object.create(EmsysModule.prototype);
EmsysSineGenerator.prototype.interface = function(ui, coord) {
	ui.text(coord.x+2, coord.y+2, this.info.defaultName);
}
EmsysSineGenerator.prototype.run = function(t, z, outputIndex) {
	if( z == 1 ) return this.lastSample;
	var pm = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
	var f  = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 440;
	return this.lastSample = Math.sin( Math.PI*2*f*t + pm );
};

//---------
// Product of the two inputs is the output.
var EmsysMultiplier = function(id) {
	EmsysModule.call(this, id);
	this.info = {
		numberOfInputs : 2,
		numberOfOutputs: 1,
		color: 80, width: 57, height: 40,
		defaultName: "Multiplier"
	}
}
EmsysMultiplier.prototype = Object.create(EmsysModule.prototype);
EmsysMultiplier.prototype.interface = function(ui, coord) {
	ui.text(coord.x + 17, coord.y + 17, "*",2);
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
	this.info = {
		numberOfInputs : 0,
		numberOfOutputs: 1,
		color: 170, width: 50, height: 20
	}
	this.params[0] = 1;
	this.params[1] = 5;
}
EmsysNumber.prototype = Object.create(EmsysModule.prototype);
EmsysNumber.prototype.interface = function(ui, coord) {
	ui.text( coord.x + 2, coord.y + 7, Math.round(this.params[0]*100)/100 ) ;
}
EmsysNumber.prototype.run = function (t,z) {
	return this.params[0];
}
EmsysNumber.prototype.handleDrag = function(e) {
	this.params[0] -= e.movementY/this.params[1];
}
//---