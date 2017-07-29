class WindowNumber extends InterfaceWindowComponent {
	constructor		(con = {}) {
		super(con);

		this.w				= 3/4;
		this.h 				= 10;

		this.getValue		= con.getValue || (z => "");
		this.setValue		= con.setValue || (z => {});

		this.isTyping 		= false;
		this.inputBuffer	= this.getValue();
		this.acceptedChars	= "0123456789.-";
	}

	eMouseDown		(x, y) {
		this.isTyping = true;
		this.inputBuffer = "";
	}

	eUnfocus		() {
		if (this.isTyping) {
			this.isTyping = false;
			this.setValue( this.inputBuffer = parseFloat(this.inputBuffer) || 0 );
			this.inputBuffer = this.inputBuffer.toString();
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
					if (this.acceptedChars.indexOf(e.key) !== -1)
						this.inputBuffer += e.key;
			}
	}

	render			(g, w, h) {
		g.setColor(1);
		g.box(0, 0, w, h);

		let charle = ~~(w/8);
		
		g.setColor(~~this.isTyping)
		g.fillBox(1, 1, w-1, h-1);
		g.setColor(1-~~this.isTyping)
		g.text(2, 2, (this.inputBuffer.length > charle)? "..." + this.inputBuffer.substr(-charle+3) : this.inputBuffer.toString().substr(0,charle));

	}
}