class WindowTextField extends InterfaceWindowComponent {
	constructor		(con = {}) {
		super(con);

		this.w				= 3/4;
		this.h 				= Graphics.textSize("A")[1]+4;

		this.getValue		= con.getValue || (z => {});
		this.setValue		= con.setValue || (z => {});

		this.isTyping 		= false;
		this.inputBuffer	= this.getValue() || "";
	}

	eMouseDown		(x, y) {
		this.isTyping = true;
	}

	eUnfocus		() {
		if (this.isTyping) {
			this.isTyping = false;
			this.setValue( this.inputBuffer );
		}
	}

	eKeyDown		(e) {
		if (this.isTyping)
			switch(e.key) {
				case 'Enter':
					if (!e.shiftKey) 
						this.eUnfocus();
					else
						this.inputBuffer += "\n";
					break;
				case 'Backspace':
					this.inputBuffer = this.inputBuffer.substr(0, this.inputBuffer.length - 1);
					break;
				case 'Shift':
				case 'Control':
				case 'Alt':
				case 'Meta':
					break;
				default:
					this.inputBuffer += e.key;
			}
	}

	render			(g, w, h) {
		g.context.fillStyle = g.context.strokeStyle = "#fff";
		g.box(0, 0, w, ~~h);

		let chunks = this.inputBuffer.split("\n");
		
		g.context.fillStyle = (this.isTyping)? "#fff" : "#000";
		g.context.fillRect(1, 1, w-1.5, ~~h-1);
		g.context.fillStyle = (this.isTyping)? "#000" : "#fff";
		g.text(2, 2, chunks[chunks.length - 1]);

	}
}