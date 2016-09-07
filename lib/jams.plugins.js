// Super Class ---
JAMS.Module = function(config) {
	if( !(this instanceof JAMS.Module)) return new JAMS.Module(config);
	
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

JAMS.Module.prototype.interface = function() {}
JAMS.Module.prototype.handleDrag = function() {}
JAMS.Module.prototype.run = function() {}
JAMS.Module.prototype.setParam = function(index, value) {
	this.params[index].value = value;
	return this;
}
JAMS.Module.prototype.setInput = function(node, index, originIndex, id) {
	this.inputs[index] = {};
	this.inputs[index].id = id;
	this.inputs[index].module = node;
	this.inputs[index].index = originIndex;
	return this;
}
JAMS.Module.prototype.unsetInput = function(index) {
	delete this.inputs[index];
	return this;
}
JAMS.Module.prototype.connect = function(node, index, originIndex) { 
	node.setInput(this, index, originIndex, this.id);
	return this;
}

//--------------
// one input.
var JAMSOutput = function(config) {
	JAMS.Module.call(this, config);

	this.className = "JAMSOutput";

	this.numberOfInputs = 1;
	this.numberOfOutputs= 0;
	this.color			= 25;
	this.width			= 40;
	this.height			= 20;
	this.name 	= "output";

}
JAMSOutput.prototype = Object.create(JAMS.Module.prototype);

JAMSOutput.prototype.interface = function(ui, uiVars) {
	ui.text( 8, 7, this.name);
}
JAMSOutput.prototype.run = function(t, z) { 
	return (this.inputs[0])? this.inputs[0].module.run(t, z, this.inputs.index) : 0 ;
}

//----------
// input0: frequency
// input1: phase

var JAMSSineGenerator = function(config) {
	JAMS.Module.call(this, config);

	this.className = "JAMSSineGenerator";
		
	this.prerun			= true;
	this.numberOfInputs	= 2;
	this.numberOfOutputs= 1;
	this.color 			= 100;
	this.width 			= 80;
	this.height 		= 40;
	this.name 			= "sine osc";

	// need dis
	this.lastSample = 0;
}

JAMSSineGenerator.prototype = Object.create(JAMS.Module.prototype);
JAMSSineGenerator.prototype.interface = function(ui, uiVars) {
	ui.text( 2, 2, this.name);
}
JAMSSineGenerator.prototype.run = function(t, z, outputIndex) {
	if( z == 1 ) return this.lastSample;
	var pm = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
	var f  = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 440;
	return this.lastSample = Math.sin( Math.PI*2*f*t + pm );
};

//---------
// Product of the two inputs is the output.
var JAMSMultiplier = function(config) {
	JAMS.Module.call(this, config);
	
	this.className = "JAMSMultiplier";

	this.numberOfInputs = 2;
	this.numberOfOutputs= 1;
	this.color 			= 80; 
	this.width 			= 40; 
	this.height 		= 40;
	this.name 			= "multiplier";
}

JAMSMultiplier.prototype = Object.create(JAMS.Module.prototype);
JAMSMultiplier.prototype.interface = function(ui, uiVars) {
	ui.text( 17, 17, "*",2);
}
JAMSMultiplier.prototype.run = function (t, z) {
	var input1 = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 0;
	var input2 = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
	return input1 * input2;
}
// ----
// Returns a number.
// Param0 = number itself
// Param1 = Sensitivity of the dragging
var JAMSNumber = function(id) {
	JAMS.Module.call(this, id);

	this.className = "JAMSNumber";

	this.numberOfInputs = 0;
	this.numberOfOutputs= 1;
	this.color 			= 170; 
	this.width 			= 50; 
	this.height 		= 20;
	this.name 			= "number";

	this.meta = {};
	
	this.params[0] = {};
	this.params[0].name = "Value";
	this.params[0].type = "number";
	this.params[0].value = 1;
	this.params[1] = {};
	this.params[1].name = "Drag Sensitivity";
	this.params[1].type = "number";
	this.params[1].value = 5;
}
JAMSNumber.prototype = Object.create(JAMS.Module.prototype);
JAMSNumber.prototype.interface = function(ui, uiVars) {
	ui.text(  uiVars.ioWidth + 2, 7, Math.round(this.params[0].value*100)/100 );
}
JAMSNumber.prototype.run = function (t,z) {
	return this.params[0].value;
}
JAMSNumber.prototype.handleDrag = function(e) {
	this.params[0].value -= e.movementY/this.params[1].value;
}
// ----
// Time t. Returns t, basically.
var JAMSt = function(id) {
	JAMS.Module.call(this, id);

	this.className = "JAMSt";

	this.numberOfInputs = 0;
	this.numberOfOutputs= 1;
	this.color 			= 40; 
	this.width 			= 30; 
	this.height 		= 20;
	this.name 			= "time";

}
JAMSt.prototype = Object.create(JAMS.Module.prototype);
JAMSt.prototype.interface = function(ui, uiVars) {
	ui.text( 14, 7, "t" ) ;
}
JAMSt.prototype.run = function (t,z) {
	return t;
}
// ---
// Remainder Modulo
var JAMSRemainder = function(id) {
	JAMS.Module.call(this, id);

	this.className = "JAMSRemainder";

	this.numberOfInputs = 2;
	this.numberOfOutputs= 1;
	this.color 			= 180; 
	this.width 			= 40; 
	this.height 		= 40;
	this.name 			= "remainder";

}
JAMSRemainder.prototype = Object.create(JAMS.Module.prototype);
JAMSRemainder.prototype.interface = function(ui, uiVars) {
	ui.text( 17, 15, "%", 2);
}
JAMSRemainder.prototype.run = function (t,z) {
	var input1 = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 0;
	var input2 = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
	return input1 % input2;
}
// ---
// 4Array. Takes in 5 input. First is index, 4 others are values. Returns the value of the index given and floors it.
var JAMS4Array = function(id) {
	JAMS.Module.call(this, id);

	this.className = "JAMS4Array";

	this.numberOfInputs = 5;
	this.numberOfOutputs= 1;
	this.color 			= 280; 
	this.width 			= 20; 
	this.height 		= 100;
	this.name 			= "remainder";

	this.curIndex = 1;

}
JAMS4Array.prototype = Object.create(JAMS.Module.prototype);
JAMS4Array.prototype.interface = function(ui, uiVars) {
	ui.context.fillRect( -10 , 20*this.curIndex, 10, 20 );
}
JAMS4Array.prototype.run = function (t,z) {
	if (this.inputs[0] == undefined) return;
	var index = this.curIndex = (this.inputs[0])? Math.floor(Math.abs(this.inputs[0].module.run(t, 1,this.inputs[0].index)+1)) : 0;
	var output = (this.inputs[index])? this.inputs[index].module.run(t, 1, this.inputs[index].index) : 0;
	return output;
}