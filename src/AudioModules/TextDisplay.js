Modules.TextDisplay = class TextDisplay extends AudioModule {
	constructor		(con) {
		super(con);

		this.className 		= "TextDisplay";
		this.numberOfInputs = 0;
		this.numberOfOutputs= 0;
		this.color 			= 1; 
		this.width 			= 150; 
		this.height 		= 30;
		this.name 			= "number";
		
		this.params[0] = {
			name: "Text",
			type: "text",
			value: "<enter text here>"
		};
		this.params[1] = {
			name: "Width",
			type: "number",
			value: 150,
		
		};
		this.params[2] = {
			name: "Height",
			type: "number",
			value: 30
		};

	}

	interface		(g, args) {
		this.width = this.params[1].value;
		this.height = this.params[2].value;
		g.text(4, 4,  this.params[0].value );
	}

	run				(t, z, a) {
		return ;
	}
}