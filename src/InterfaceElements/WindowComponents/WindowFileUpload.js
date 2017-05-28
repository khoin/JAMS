class WindowFileUpload extends InterfaceWindowComponent {
	constructor		(con = {}) {
		super(con);

		this.w				= 3/4;
		this.h 				= 10;

		this.getValue		= con.getValue || (z => "");
		this.setValue		= con.setValue || (z => {});
		this.ext 			= con.extension || "";

		this.fileName 		= "";
		this.isHovered 		= false;
	}

	eMouseDown		(x, y) {
		var opener = document.createElement("input");
		opener.type = "file";
		opener.addEventListener('change', e => {
			let file = e.target.files[0]
			if(!file || (this.ext !== "" && file.name.substr(-1-this.ext.length).toLowerCase() !== "."+this.ext)) return;
			var reader = new FileReader();
			reader.onload = (e) => {
				this.fileName = file.name;
				this.setValue(e.target.result);
			}
			reader.readAsBinaryString(file.slice(0, file.size));
			
		});
		opener.click();
	}

	eUnfocus		() {

	}

	eKeyDown		(e) {

	}

	eMouseOut		(e) {
		this.isHovered = false;
	}

	eMouseMove		(e) {
		this.isHovered = true;
	}

	render			(g, w, h) {
		g.context.fillStyle = g.context.strokeStyle = "#fff";
		g.text(32, 2, this.fileName);
		g.box(0, 0, 26, h);
		if (this.isHovered) {
			g.context.fillRect(0, 0, 26, h);
			g.context.fillStyle = "#000";
			g.text(2, 2, "OPEN");

		} else {
			g.text(2, 2, "OPEN");
		}
		
	}
}