Modules.Scope = class Scope extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "Scope";
		this.prerun    = true;

		this.numberOfInputs	= 1;
		this.numberOfOutputs= 0;
		this.color			= 237; 
		this.width			= 60; 
		this.height			= 30;
		this.name			= "scope";
		this.helpText		=
`---- Scope ----
Oscilloscope
`;
		this.array = new Array(this.width)
		
	}

	interface	(g, args) {
		for(var i=0; i < this.array.length; ++i) 
			g.point(i, ~~(Math.min(1, this.array[i]) * this.height) );
	}
	
	run			(t, z, a) {
		if(!this.inputs[0]) return;
		this.array.unshift( this.getInput(0, t, 1)[0]/2 + 0.5);
		this.array.pop();
	}
}