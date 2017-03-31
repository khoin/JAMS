// Super Class ---
// t,z,a : time, recursive? (1: no, 0: sure), outputIndex

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
	this.helpText = "No HelpText Available";
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
	this.helpText 		= 
`---- SineGenerator ----
* 1st Input : Frequency 
* 2nd Input : Phase 

---- *** Tips *** ----
Input another signal into the 2nd input
to create Phase Modulation.
`;

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
	this.helpText =
`---- Multiplier ----
Multiplies two inputs together. 
Default signal for either input is zero.

---- *** Tips *** ----
To change a volume of a signal, multiple
that signal with a number.
If that number = 1, full volume.
If that number = 0, it is muted.

Without the existence of a Pow() module
You can multiple the same signal to itself
to generate a quadratic curve from linear.
`;
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
	this.helpText =
`---- Number ----
Returns the number displayed.
Shift + Drag this number to change
is value. 
The Sensitivity of the drag can be altered
through the Parameters window.
`;

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
	var displayingText = Math.round(this.params[0].value*10000)/10000;
	displayingText = displayingText.toString();
	ui.text( 6, 7, (displayingText.length > 8)? ".."+displayingText.substr(0,8) : displayingText );
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
	this.helpText =
`---- Time ----
Returns current time in seconds.
`;

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
	this.helpText =
`---- Remainder ----
Returns the remainder after dividing the 
first input by the second input.

E.g: 10 % 4 = 2;
`;

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
// ----
// Pluser
var JAMSPlus = function(id) {
	JAMS.Module.call(this, id);

	this.className = "JAMSPlus";

	this.numberOfInputs = 2;
	this.numberOfOutputs= 1;
	this.color 			= 380; 
	this.width 			= 40; 
	this.height 		= 40;
	this.name 			= "plus";
	this.helpText =
`---- Plus ----
Adds the two inputs together.
Acts as a mixer.
Remember, signals exceeding [1;-1]
will be clipped.
`;

}
JAMSPlus.prototype = Object.create(JAMS.Module.prototype);
JAMSPlus.prototype.interface = function(ui, uiVars) {
	ui.text( 17, 15, "+", 2);
}
JAMSPlus.prototype.run = function (t,z) {
	var input1 = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 0;
	var input2 = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
	return input1 + input2;
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
	this.name 			= "4array";
	this.helpText =
`---- 4Array ----
The first input determines which input from 2-5
to return. The first input is rounded to the 
lower integer and modulo if it exceeds 5.
E.g: Input 1 = 7.8;
Output = Input[ 1 + floor(7.8%4) ] =
       = Input[ 1 + 3 ] = Input 4

---- *** Tips *** ----
Very useful for simple melodies. You can
nest these together to create a song.
`;

	this.curIndex = 1;

}
JAMS4Array.prototype = Object.create(JAMS.Module.prototype);
JAMS4Array.prototype.interface = function(ui, uiVars) {
	ui.context.fillRect( -uiVars.ioWidth , uiVars.ioHeight*this.curIndex, uiVars.ioWidth, uiVars.ioHeight );
}
JAMS4Array.prototype.run = function (t,z) {
	if (this.inputs[0] == undefined) return;
	var index = this.curIndex = (this.inputs[0])? Math.floor(Math.abs(this.inputs[0].module.run(t, 1,this.inputs[0].index)%4+1)) : 0;
	var output = (this.inputs[index])? this.inputs[index].module.run(t, 1, this.inputs[index].index) : 0;
	return output;
}
// ----
var JAMSmidiNote = function(id) {
	JAMS.Module.call(this, id);

	this.className = "JAMSmidiNote";

	this.numberOfInputs  = 0;
	this.numberOfOutputs = 4;
	this.color 			 = 340;
	this.width 			 = 50;
	this.height 		 = 80;
	this.name 			 = "NoteInput";
	this.helpText = 
`---- midiNote ----
1st Output: Sends a pulse when noteOn is received
2nd Output: Sends a pulse when noteOff is received
3rd Output: Returns the last note value
4rd Output: Returns the last velocity value

---- *** Tips *** ----
Use the 3rd Output and route it through a 
Note2Freq module to convert it to Hertz. 
Then, route it to a SineGenerator.
`;

	this.midiRequest = true;
	this.midiParamIndex = 0;

	this.params[0] = {};
	this.params[0].name = "midi data";
	this.params[0].type = "Array";
	this.params[0].value = new Uint8Array([144,69,12]);
	this.params[1] = {};
	this.params[1].name = "channel";
	this.params[1].type = "number";
	this.params[1].value = 1;

	//on, off, note, vel
	this.runningValues = [0,0,0,0];
}
JAMSmidiNote.prototype = Object.create(JAMS.Module.prototype);

JAMS.Module.prototype.setParam = function(index, value) { 
	this.params[index].value = value;
	if( index !== 0 ) return this;
	if(value[0] == (143 + this.params[1].value)) { this.runningValues[0] = 1; this.runningValues[2] = value[1]; this.runningValues[3] = value[2]; }
	if(value[0] == (127 + this.params[1].value) && this.runningValues[2] == value[1]) this.runningValues[1] = 1;
	return this;
}
JAMSmidiNote.prototype.interface = function(ui, uiVars) {
	var firstOffset = uiVars.ioHeight/2 - 2.5;
	["on trigger", "off trigger", "note", "velocity"].forEach( (label, index) => {
		ui.text(4, firstOffset + uiVars.ioHeight*index, label);
	})
}
JAMSmidiNote.prototype.run = function(t, z, a) { 
	var outputValues = this.runningValues.slice();
	if( (a == 1 || a == 0) && z !== 1 ) this.runningValues[a] = 0;
	return outputValues[a];
}
//---
var JAMSNote2Freq = function(id) {
	JAMS.Module.call(this, id);

	this.className = "JAMSNote2Freq";

	this.numberOfInputs = 1;
	this.numberOfOutputs= 1;
	this.color 			= 130; 
	this.width 			= 50; 
	this.height 		= 20;
	this.name 			= "note2freq";

	this.params[0] = {};
	this.params[0].name = "Tuning";
	this.params[0].type = "number";
	this.params[0].value = 440;
	this.params[1] = {};
	this.params[1].name = "transpose";
	this.params[1].type = "number";
	this.params[1].value = 0;
}
JAMSNote2Freq.prototype = Object.create(JAMS.Module.prototype);
JAMSNote2Freq.prototype.interface = function(ui, uiVars) {
	ui.text( 6, 7, "NOTE->FREQ" );
}
JAMSNote2Freq.prototype.run = function (t, z, a) {
	if(this.inputs[0] == undefined) return;
	return Math.pow(2, ( this.inputs[0].module.run(t, 1, this.inputs[0].index) + this.params[1].value - 69 ) / 12) * this.params[0].value;
}
// ----
// first input on triggger/ second is off trigger. outputs 1 and 0
var JAMSOnOffEnvelope = function(id) {
	JAMS.Module.call(this, id);

	this.className = "JAMSOnOffEnvelope";

	this.numberOfInputs = 2;
	this.numberOfOutputs= 1;
	this.color 			= 10;
	this.width 			= 20;
	this.height 		= 40;
	this.name 			= "on/off envelope";
	this.helpText =
`---- OnOffEnvelope ----
1st Input: Receives NoteOn trigger
2nd Input: Receives NoteOff trigger

When a trigger (a signal with its current value being
1 higher than its last value) is received,
the envelope either turns on or off.
`;

	this.output = 0;
	this.lastOn  = 0;
	this.lastOff = 0;
}
JAMSOnOffEnvelope.prototype = Object.create(JAMS.Module.prototype);
JAMSOnOffEnvelope.prototype.interface = function(ui, uiVars) {
	if(this.output == 1) ui.context.fillRect(0,0,20,40);
}
JAMSOnOffEnvelope.prototype.run = function (t, z, a) {
	if(!this.inputs[0] || !this.inputs[1]) return;
	var newOn  = this.inputs[0].module.run(t, 0, this.inputs[0].index),
	 	newOff = this.inputs[1].module.run(t, 0, this.inputs[1].index);
	if ( newOn -this.lastOn  >= 1) this.output = 1; 
	if ( newOff-this.lastOff >= 1) this.output = 0; 
	this.lastOn  = newOn;
	this.lastOff = newOff;
	return this.output;
}
// ----
var JAMSSimpleDecay = function(id) {
	JAMS.Module.call(this, id);

	this.className = "JAMSSimpleDecay";

	this.numberOfInputs = 2;
	this.numberOfOutputs = 1;
	this.color 			= 30;
	this.width 			= 20;
	this.height 		= 40;
	this.name 			= "simple decay";
	this.helpText =
`---- SimpleDecay ----
1st Input: Receives NoteOn trigger
2nd Input: The value being deducted every execution

It basically listens to only NoteOn. When it catches one,
it fires, keep deducting the value being fed to the second
input until it hits zero.
---- *** Tips *** ----
Use the OneOverSRate module with this one. That module basically
shows the millisecond and returns the value the envelope needs
to deduct per sample call.
`;

	this.output = 0;
	this.attack = false;
	this.lastTrig = 0;
}
JAMSSimpleDecay.prototype = Object.create(JAMS.Module.prototype);
JAMSSimpleDecay.prototype.interface = function(ui, uiVars) {
	ui.context.fillRect(0,this.height-(this.output*this.height),20,1);
}
JAMSSimpleDecay.prototype.run = function (t, z, a) {
	if(!this.inputs[0] ) return;
	var newTrig = this.inputs[0].module.run(t, 0, this.inputs[0].index);
	if( newTrig - this.lastTrig >= 1) { this.attack = true; }
	if(this.output >= 1) { this.attack = false; }
	this.lastTrig = newTrig;
	if(this.attack) return this.output = Math.min(this.output + 0.09, 1); 
	this.output -= (this.inputs[1])? ( this.inputs[1].module.run(t, 0, this.inputs[0].index) ) : 0.00001; 
	this.output = Math.max(0, this.output);
	return this.output;
}
// ------
// basically returns 1/window.sampleRate;
var JAMSMilliseconds = function(id) {
	JAMS.Module.call(this, id);

	this.className = "JAMSMilliseconds";

	this.numberOfInputs = 0;
	this.numberOfOutputs= 1;
	this.color 			= 0; 
	this.width 			= 50; 
	this.height 		= 20;
	this.name 			= "milliseconds";
	this.helpText =
`---- Milliseconds ----
It basically shows
the millisecond, and returns the amount of deduction
to reach from 1 to 0 (zero) within the millisecond 
displayed.

---- *** Tips *** ----
Use with the SimpleDecay envelope.
E.g: 500 will return 1000/500 * 1/sampleRate
= 2 * 1/48000

If you were to deduct this amount from 1 every sample,
then you'd reach zero after 500 milliseconds,
given that the app environment is in 48KHz.
`;

	this.params[0] = {};
	this.params[0].name = "Value";
	this.params[0].type = "number";
	this.params[0].value = 1;
	this.params[1] = {};
	this.params[1].name = "Drag Sensitivity";
	this.params[1].type = "number";
	this.params[1].value = 5;

	this.con = 1/sampleRate;
}
JAMSMilliseconds.prototype = Object.create(JAMS.Module.prototype);
JAMSMilliseconds.prototype.interface = function(ui, uiVars) {
	var displayingText = Math.round(this.params[0].value*10000)/10000;
	displayingText = displayingText.toString();
	ui.text( 6, 7, (displayingText.length > 8)? ".."+displayingText.substr(0,8) : displayingText );
}
JAMSMilliseconds.prototype.run = function (t,z) {
	return 1000/this.params[0].value * this.con;
}
JAMSMilliseconds.prototype.handleDrag = function(e) {
	this.params[0].value -= e.movementY/this.params[1].value;
}
// --- debugger
var JAMSDebugger = function(id) {
	JAMS.Module.call(this,id);

	this.className = "JAMSDebugger";

	this.prerun = true;

	this.numberOfInputs = 1;
	this.numberOfOutputs  = 0;
	this.color = 90;
	this.width = 80;
	this.height= 40;
	this.name  = "debugger";
	this.helpText =
`---- Debugger ----
Displays the waveform.
`;

	this.array = new Array(this.width);
	this.array.fill(0);
}
JAMSDebugger.prototype = Object.create(JAMS.Module.prototype);
JAMSDebugger.prototype.interface = function(ui, uiVars) {
	var _ = this;
	for(var i=0; i<_.array.length; ++i) {
		ui.point(i, Math.round(Math.min(1,_.array[i])*_.height) );
	}
}
JAMSDebugger.prototype.run = function(t,z,a) {
	if(!this.inputs[0]) return;
	this.array.unshift( this.inputs[0].module.run(t,1, this.inputs[0].index)/2 + 0.5);
	this.array.pop();
}

//--- 
// One pole filter
// Please see: https://github.com/opendsp/filter/blob/master/index.js
// Authors: stagas, Will Pirkle, et al.
// input, cut, typ

var JAMSOnePole = function(id) {
	JAMS.Module.call(this, id);

	this.className = "JAMSOnePole";

	this.prerun = false;

	this.numberOfInputs = 3;
	this.numberOfOutputs = 1;
	this.color = 50;
	this.width = 80;
	this.height= 60;
	this.name  = "filter";

	this.type = 0;
 	this.out = [];
	this.fc = 200;
	this.a = 1;
	this.b = 1;
	this.z1 = 0;
	this.reset();
	this.update();
}

JAMSOnePole.prototype = Object.create(JAMS.Module.prototype);

JAMSOnePole.prototype.interface = function(ui, uiVars) {
	var labels = ["input", "cutoff", "type"];
	for (var i = 0; i < labels.length; i++)
		ui.text(5, 5 + i * 20, labels[i]);
}

JAMSOnePole.prototype.prewarp = function(f){
  return Math.tan(Math.PI * f / sampleRate);
}

JAMSOnePole.prototype.reset = function(){
  	this.z1 = 0;
}

JAMSOnePole.prototype.update = function(){
  var wa = this.prewarp(this.fc);
  this.a = wa / (1.0 + wa);
}

JAMSOnePole.prototype.run = function(t, z, a) { 
	if(!this.inputs[0]) return;
	if(isNaN(this.out[0])) this.reset();
	var out = this.out;
	this.fc = (!this.inputs[1])? 300 : Math.abs(this.inputs[1].module.run(t, 1, this.inputs[1].index));
	this.update();
	var type = (!this.inputs[2])? 0 : this.inputs[2].module.run(t, 1, this.inputs[2].index);
	var xn = this.inputs[0].module.run(t, 1, this.inputs[0].index);
	var vn = (xn - this.z1) * this.a;
	out[0] = vn + this.z1;
	this.z1 = vn + out[0];
	out[1] = xn - out[0];
	out[2] = out[0] - out[1];
	return out[~~type];
}

//---
// Sawtooth Wave (yes, finally)

var JAMSSawtoothGenerator = function(config) {
	JAMS.Module.call(this, config);

	this.className = "JAMSSawtoothGenerator";
		
	this.prerun			= true;
	this.numberOfInputs	= 2;
	this.numberOfOutputs= 1;
	this.color 			= 300;
	this.width 			= 80;
	this.height 		= 40;
	this.name 			= "saw osc";
	this.helpText 		= 
`---- SawtoothGenerator ----
* 1st Input : Frequency 
* 2nd Input : Phase
---- *** Tips *** ----
Input another signal into the 2nd input
to create Phase Modulation.
`;

	// need dis
	this.lastSample = 0;
}

JAMSSawtoothGenerator.prototype = Object.create(JAMS.Module.prototype);
JAMSSawtoothGenerator.prototype.interface = function(ui, uiVars) {
	ui.text( 2, 2, this.name);
}
JAMSSawtoothGenerator.prototype.run = function(t, z, outputIndex) {
	if( z == 1 ) return this.lastSample;
	var pm = (this.inputs[1])? this.inputs[1].module.run(t, 1, this.inputs[1].index) : 0;
	var f  = (this.inputs[0])? this.inputs[0].module.run(t, 1, this.inputs[0].index) : 440;
	return this.lastSample = (1 - 2 * ((t + pm) % (1 / f)) * f);
};
