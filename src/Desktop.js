class Desktop {
	constructor		(Graphics, moduleList) {
		this.g		= Graphics;
		this.mL		= moduleList;

		// Constants (not technically)
		this.portSize		= 15;

		// Display
		this.cX				= 0;
		this.cY				= 0;
		this.sXY			= 1;
		// Mouse
		this.mX				= 0;
		this.mY				= 0;
		// Modules
		this.selectedModule	= undefined;
		this.selectedInput 	= -1;
		this.selectedOutput	= -1;

		this.caplocks = false;
	}

	scaleUp			(e) { 
		this.cX 	-= ~~this.mouseMapX(e.clientX); 
		this.cY 	-= ~~this.mouseMapY(e.clientY);
		this.sXY	= ~~(this.sXY + 1);
	}

	scaleDown		(e) {
		if ( this.sXY == 1 ) return;
		this.cX 	+= ~~this.mouseMapX(e.clientX); 
		this.cY 	+= ~~this.mouseMapY(e.clientY);
		this.sXY	= ~~(this.sXY - 1);
	}

	mouseMapX 		(x) {
		return (x - this.cX)/this.sXY;
	}

	mouseMapY 		(y) {
		return (y - this.cY)/this.sXY;
	}

	isOnModule 		(x, y) {
		x = this.mouseMapX(x);
		y = this.mouseMapY(y);

		var _m = undefined;
		this.mL.some(m => x > m.x - this.portSize && x < m.x + m.width + this.portSize && y > m.y && y < m.y + m.height && (_m = m));
		return _m;
	}

	isOnInput 		(m, x, y) {
		if (!m) return -1;
		x = this.mouseMapX(x);
		y = this.mouseMapY(y);
		return ( x < m.x && y < m.y + m.numberOfInputs * this.portSize )? ~~((y - m.y)/this.portSize) : -1;
	}

	isOnOutput		(m, x, y) { 
		if (!m) return -1;
		x = this.mouseMapX(x);
		y = this.mouseMapY(y);
		return ( x > m.x + m.width && y < m.y + m.numberOfOutputs * this.portSize )? ~~((y - m.y)/this.portSize) : -1;
	}

	eMouseDown		(e, listener) { 
		const x = e.clientX, y = e.clientY;
		const m = this.isOnModule(x, y);

		if (m) {
			this.selectedModule	= m;
			this.selectedOutput	= this.isOnOutput(m, x, y);

			if(this.selectedOutput !== -1) return;

			if (e.shiftKey || this.caplocks) {
				listener.turnOn("eModuleShiftDrag");
				this.selectedModule.eMouseDown(this.mouseMapX(x) - this.selectedModule.x, this.mouseMapY(y) - this.selectedModule.y);
			} else {
				listener.turnOn("eModuleDrag");
			}

		} else {
			listener.turnOn("eDrag");
		}
	}

	eMouseUp		(e, listener) {
		const x = e.clientX, y = e.clientY;
		const m = this.isOnModule(x, y);
		let i = -1;

		if (m && (i = this.isOnInput(m, x, y)) !== -1) 
			if(this.selectedOutput !== -1) {
				if( m.inputs[i] && m.inputs[i].index == this.selectedOutput ) m.unsetInput(i);
				this.selectedModule.connect(m, i, this.selectedOutput);
			}

		this.selectedOutput = this.selectedInput = -1;

		listener.turnOff("eModuleShiftDrag");
		listener.turnOff("eModuleDrag");
		listener.turnOff("eDrag");
	}

	eDrag 			(e) {
		this.cX += e.movementX;
		this.cY += e.movementY;
	}

	eMouseMove		(e) { 
		this.mX = this.mouseMapX(e.clientX);
		this.mY = this.mouseMapY(e.clientY);
	}

	eModuleDrag		(e) {
		this.selectedModule.x += e.movementX / this.sXY;
		this.selectedModule.y += e.movementY / this.sXY;
	}

	eModuleShiftDrag(e) {
		let x = this.mouseMapX(e.clientX ) - this.selectedModule.x;
		let y = this.mouseMapY(e.clientY ) - this.selectedModule.y;
		this.selectedModule.eDrag(e, x, y);
	}

	eKeyDown		(e) {
		if (e.key == "CapsLock")
			this.caplocks = !this.caplocks;
	}

	render 			() {
		const g = this.g;
		const portSize = this.portSize;

		g.context.fillStyle = "#fff";
		if (this.caplocks) 
			g.text(5, 5, "CAPLOCKS ON");

		g.context.save();

		g.context.translate(this.cX, this.cY);
		g.context.scale(this.sXY, this.sXY);

		if (this.selectedOutput !== -1) {
			const m = this.selectedModule;
			g.context.fillStyle = "#fff";
			g.line(
				m.x + m.width + portSize, 
				m.y + portSize/2 + this.selectedOutput * portSize,
				this.mX,
				this.mY
			);
		}

		for ( let i = 0; i < this.mL.length; i++ ) { 
			const m = this.mL[i];

			// Draw current module
			g.context.fillStyle = g.context.strokeStyle = `hsl(${m.color}, 100%, ${(m == this.selectedModule)? 65 : 85}%)`;
			g.box(m.x, m.y, m.width, m.height);

			// Draw inputs & outputs
			for (let j=0; j < m.numberOfInputs ; j++) 
				g.box(m.x - portSize, m.y + j * portSize, portSize, portSize);
			for (let j=0; j < m.numberOfOutputs; j++) 
				g.box(m.x + m.width, m.y + j * portSize, portSize, portSize);

			// Draw connections
			for (let j=0; j < m.inputs.length; j++) { 
				// Skip empty ports
				if (!m.inputs[j]) continue;

				const sourceModule = m.inputs[j].module;
				g.line(
					m.x - portSize,
					m.y + portSize/2 + portSize * j,
					sourceModule.x + sourceModule.width + portSize,
					sourceModule.y + portSize/2 + portSize * m.inputs[j].index
				);
			}

			// Module local rendering
			g.context.save();
			g.context.translate(~~m.x, ~~m.y);
				m.interface(g, { portSize: portSize } );
			g.context.restore();
		}

		g.context.restore();
	}
}
