Modules.ClockDivider = class ClockDivider extends AudioModule {
	constructor (con) {
		super(con);

		this.className = "ClockDivider";
		this.prerun    = true;

		this.numberOfInputs	= 1;
		this.numberOfOutputs= 5;
		this.color			= 7; 
		this.width			= 40; 
		this.height			= 75;
		this.name			= "cdivider";
		this.helpText		=
`---- ClockDivider ----
ITS NOT WORKING
`;
		this.position = 0;
		this.on = 0;
	}

	interface	(g, args) {
		let portSize = args.portSize;
		let anchor   = portSize/2 - 3;
		for( let i = 0; i < 5; i ++)
			g.text(4, anchor + portSize * i, "1/" + (64 >> i));
	}
	
	run			(t, z, a) {
		if (z === 1) return [this.on * (this.position%Math.pow(2,a) == 0) * 1.5, 0];

		if(this.getInput(0, t, 1)[0] > 0.9) {
			this.position = (this.position+1)%64;
			this.on = 1;
		} else {
			this.on = 0;
		}
	}
}