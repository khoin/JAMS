class WindowColor extends InterfaceWindowComponent {
	constructor		(con = {}) {
		super(con);

		this.w				= 3/4;
		this.h 				= 10;

		this.getValue		= con.getValue || (z => "");
		this.setValue		= con.setValue || (z => {});

		this.isTyping 		= false;
		this.inputBuffer	= this.getValue().toString();
		this.tempColor		= this.inputBuffer;
		this.acceptedChars	= "0123456789abcdefABCDEF#";
		this.validation		= /^\#[0-9a-fA-F]{6}$/i;
	}

	eMouseDown		(x, y) {
		this.isTyping = true;
	}

	eUnfocus		() {
		if (this.isTyping) {
			this.isTyping = false;
			this.inputBuffer = (this.validation.test(this.inputBuffer))? this.inputBuffer.toUpperCase() : "#000000";
			this.setValue(this.inputBuffer);
		}
	}

	eKeyDown		(e) { 
		if (this.isTyping)
			switch(e.key) {
				case 'Enter':
					this.eUnfocus();
					break;
				case 'Backspace':
					this.inputBuffer = this.inputBuffer.toString();
					this.inputBuffer = this.inputBuffer.substr(0, this.inputBuffer.length - 1);
					break;
				default:
					if (this.inputBuffer.length > 6) return;
					if (this.acceptedChars.indexOf(e.key) !== -1)
						this.inputBuffer += e.key;
			}

		this.tempColor = (this.validation.test(this.inputBuffer))? this.inputBuffer : this.getValue().toString();
	}

	render			(g, w, h) {
		g.setColor(1);
		g.box(0, 0, w, h);

		g.setColor(~~this.isTyping)
		g.fillBox(1, 1, w-1, h-1);
		g.context.fillStyle = this.tempColor;
		g.fillBox(1, 1, 48, h-1);
		g.setColor(1-~~this.isTyping)
		g.text(52, 2, this.inputBuffer.toString());

	}
}