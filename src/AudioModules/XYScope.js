Modules.XYScope = class XYScope extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "XYScope";
		this.prerun    = true;

		this.numberOfInputs	= 1;
		this.numberOfOutputs= 0;
		this.color			= 337; 
		this.width			= 45; 
		this.height			= 45;
		this.name			= "xyscope";
		this.helpText		=
`---- XYScope ----
Parametric Oscilloscope
Left channel, Right Channel
`;
		this.larray = new Array(256);
		this.rarray = new Array(256);
	}

	interface	(g, args) {
		for(var i=0; i < this.larray.length; ++i) 
			g.point(~~(this.larray[i] * 22) + 22, ~~(this.rarray[i] * 22) + 22 );
	}
	
	run			(t, z, a) {
		if(!this.inputs[0]) return;
		let i = this.getInput(0, t, 1);
		this.larray.unshift(i[0]);
		this.larray.pop();
		this.rarray.unshift(i[1]);
		this.rarray.pop();
	}
}