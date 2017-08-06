class JAMS {
	constructor (config) {
		// stuff
		this.moduleCounter	= 0;
		this.modules 		= [];
		this.midiModules 	= [];

		this.preferences	= new ApplicationPreference();
		this.g				= new Graphics({width: config.width, height: config.height, font: font}); //font exists because <img id=font>
		this.interface		= new Interface(this.g);
		this.desktop		= new Desktop(this.g, this.modules);
		this.mouseListeners = new ListenerList(this.g.DOMElement, ["mousedown", "mouseup", "mousemove"]);
		this.keyListeners	= new ListenerList(this.g.DOMElement, ["keydown"]);


		// Audio
		this.aC = (config.audioContext instanceof AudioContext)? config.audioContext : new AudioContext();
		window.sampleRate = this.aC.sampleRate;
		this.processor = this.aC.createScriptProcessor(this.preferences.getItem("bufferSize"), 0, 2);
		let splitter	= this.aC.createChannelSplitter();
		let merger		= this.aC.createChannelMerger();

		this.processor.connect(splitter);
		splitter.connect(merger, 0 , 0);
		splitter.connect(merger, 1 , 1);
		merger.connect(this.aC.destination);

		this.t = 0;
		this.frameCount = 0;

		this.outputModule = this.createModule(~~(innerWidth/2), ~~(innerHeight/2), Modules.Output);
		this.interface.add(new InterfaceMenuBar({menus : JAMS.Interactions.menuBarMenus, app: this}));

		//plugins
		this.plugins = [{
			name : "Oscillators",
			children: ["SineOSC"]
		},{
			name : "Math",
			children: ["Number", "Plus", "Multiplier", "Remainder", "Rand"]
		},{
			name : "Clock",
			children: ["Clock", "ClockDivider"]
		},{
			name: "MIDI/Signals",
			children: ["MidiKeyboard"]
		},{
			name : "Harmony",
			children: ["Note2Freq"]
		},{
			name: "Sequencers",
			children: ["Sequencer16", "Switch"]
		},{
			name: "Envelopes",
			children: ["LinearAD"]
		},{
			name: "Sampling",
			children: ["Sampler"]
		},{
			name: "Effects",
			children: ["Flange", "Delay"]
		},{
			name: "Misc",
			children: ["QuadMixer", "Scope", "XYScope", "Readout", "TextDisplay", "MonoMerge"]
		}];
	}

	appendTo	(element) {
		this.g.appendTo(element);
		return this;
	}

	init 		() {
		let _ = this;

		this.processor.onaudioprocess = function(e) {
			let obuffer = e.outputBuffer;
			let incr = obuffer.length/_.aC.sampleRate;

			let ldata = obuffer.getChannelData(0);
			let rdata = obuffer.getChannelData(1);

			for (let i = 0; i < obuffer.length; i++) {
				let o = _.audioLoop(_.t + (i/_.aC.sampleRate));
				ldata[i] = o[0];
				rdata[i] = o[1];
			}
			
			_.t += incr;
		}

		// MIDI Error Window
		let mid = new MIDI(error => {
			this.alert("Your browser does not support MIDI");
		});

		mid.on('any', (a,e) => { 
			this.midiModules.forEach( mod => { 
				mod.setParam(mod.midiParam, e.data);
			})
		})

		// make DOM focus-able 
		this.g.DOMElement.tabIndex = 1; // oh gosh (what does this do?)
		// okay i spent 30 minutes trying to figure out why keydown doesn't work. so this line is the thing.

		// zooming
		this.g.DOMElement.addEventListener("wheel", e => { e.preventDefault();
			if(e.ctrlKey) {
				if(e.deltaY < 0) 
					this.desktop.scaleUp(e)
				else 
					this.desktop.scaleDown(e);
			}
		})

		this.mouseListeners.add("mousedown"	, this.interface.eMouseDown			, this.interface);
		this.mouseListeners.add("mousemove"	, this.interface.eMouseMove			, this.interface);
		this.mouseListeners.add("mouseup"	, this.interface.eMouseUp			, this.interface);
		this.mouseListeners.add("mousedown"	, this.desktop.eMouseDown			, this.desktop);
		this.mouseListeners.add("mousemove"	, this.desktop.eDrag				, this.desktop, false);
		this.mouseListeners.add("mousemove"	, this.desktop.eMouseMove			, this.desktop);
		this.mouseListeners.add("mousemove"	, this.desktop.eModuleDrag			, this.desktop, false);
		this.mouseListeners.add("mousemove"	, this.desktop.eModuleShiftDrag		, this.desktop, false);
		this.mouseListeners.add("mouseup"	, this.desktop.eMouseUp				, this.desktop);

		this.keyListeners.add("keydown"		, this.interface.eKeyDown			, this.interface);
		this.keyListeners.add("keydown"		, this.desktop.eKeyDown				, this.desktop);

		// rightclick
		this.g.DOMElement.addEventListener("contextmenu", this.eContextMenu.bind(this));

		// fire rendering loop
		this.render();
	}

	eContextMenu(e) {
		e.preventDefault();
		const x = e.clientX;
		const y = e.clientY;

		let currentModule = this.desktop.isOnModule(x, y);

		if (currentModule) {

			let currentInput = this.desktop.isOnInput(currentModule, x, y);

			if (currentInput !== -1) {
				this.interface.add(
					new InterfaceContextMenu({ x: x, y: y,
						options: [{
							text: "Disconnect",
							callback: () => currentModule.unsetInput(currentInput)
						}]
					})
				)
			} else {
				// for some reason, passing `this` doesn't work, so we pass it as an argument
				JAMS.Interactions.rightClickOnModule.call(null, this, e, x, y, currentModule);
			}
		} else {
			JAMS.Interactions.rightClickOnDesktop.call(null, this, e, x, y);
		}
	}

	render 		() {
		if (this.frameCount % ~~this.preferences.getItem("fpsFactor") == 0) {
			this.g.background(this.preferences.getItem("background"));
			this.desktop.render();
			this.interface.render();
		}
		this.frameCount = (this.frameCount + 1) % 9999;
		requestAnimationFrame(this.render.bind(this));
	}

	audioLoop	(t) {
		this.modules.forEach( module => {
			if(module.prerun == true) module.run(t);
		});

		return this.outputModule.run(t, 1, 0);
	}

	createModule(x, y, module, id) {
		var mod = new module({
			id: (id)? id : ++this.moduleCounter,
			x: x,
			y: y
		});
		
		if(mod.midiRequest == true) this.midiModules.push(mod); 
		this.modules.push(mod);
		return mod;
	}

	deleteModule(deletingModule) {
		let i = 0, _ = this;

		this.midiModules.some( (module, index) => {
			if(module == deletingModule) {
				_.midiModules.splice(index, 1);
				return true;
			}
		})

		this.modules.forEach( (module, id) => {
			if( module == deletingModule ) i = id;
			module.inputs.forEach( (input, index) => {
				if( !input ) return;
				if( input.module == deletingModule ) module.unsetInput(index);
			});
		});
		this.modules.splice(i, 1);	
	}

	getModuleFromId 	(id) {
		var mod; this.modules.some( m => (mod = m).id == id );
		if(mod.id !== id) return undefined;
		return mod;
	}

	newSetup() {
		this.modules.splice(0,this.modules.length);
		this.outputModule = this.createModule(innerWidth/2, innerHeight/2, Modules.Output);
	}

	exportSetup		() {
		let fileName = "";
		this.interface
		.add(
			(new InterfaceWindow({
				title: "Save Setup", x: ~~(innerWidth/2), y: ~~(innerHeight/2), w: 200, h: 100,
				isResizable: false
			}))
			.appendChild(
				new WindowText({ content: "FILENAME", ww: 1/2, wh: 50 })
			)
			.appendChild(
				new WindowTextField({ ww: 1/2, wh: 50, 
					setValue: x => { fileName = x },
					getValue: () => fileName
				})
			)
			.appendChild(
				new WindowButton({ ww: 1 , wh: 20,
					content: "SAVE", 
					callback: () => {
						saveAs(new File([this.saveSetupToJSON()], "JAMS-"+fileName+".json", {type: "data:application/json;charset=utf-8"}));
					}
				})
			)
		)
	}

	openSetup() {
		setTimeout(() => { /**remove canvas drag listener**/ },100);
		var opener = document.createElement("input");
		opener.type = "file";
		opener.accept = ".json";
		opener.addEventListener('change', (e) => {
			if(!e.target.files[0] || e.target.files[0].name.substr(-5).toLowerCase() !== ".json") return;
			var reader = new FileReader();
			reader.onload = (e) => {
				this.loadSetup(e.target.result);
			}
			reader.readAsText(e.target.files[0]);
			
		});
		opener.click();
	}

	openSetupFromUrl (url) {
		let win = this.alert("Loading Setup...");
		fetch(url).then(response => {
			if (response.ok)
				return response.text()
			this.alert("Failed loading setup from URL");
		}).then(data => {
			this.loadSetup(data);
			win.close();
		});
	}

	alert 		(message, title = "Alert") { //this is synonymous to window.alert of the DOM
		let win = new InterfaceWindow({
				x: ~~(innerWidth/2), y: ~~(innerHeight/2),
				w: 370, h: 100,
				title: title
			});

			win
			.appendChild(new WindowText({
				ww: 1, wh: 30,
				content: message,
				fontSize: 1
			}))
			.appendChild(new WindowButton({
				ww: 1, wh: 30,
				content: "OK!",
				fontSize: 1,
				callback: () => win.close()
			}));

			this.interface.add(win);
		return win;
	}

	saveSetupToJSON() {
		var setup = [];
		this.modules.forEach( module => {
			var inputsArr = [];
			module.inputs.forEach( (input,ind) => {
				inputsArr[ind] = {
					id : input.id,
					index : input.index
				}
			});

			let params = module.params.map( p => {
				if (!p.paramSave) {
					return p.value;
				} else {
					return p.paramSave(p.value);
				}
			});

			setup.push({
				id: module.id,
				type: module.className,
				x: module.x,
				y: module.y,
				inputs: inputsArr,
				params: params,
				name: module.name
			})
		});
		return JSON.stringify(setup);
	}

	loadSetup		(json) {
		let _ = this;
		this.newSetup();
		let setup = JSON.parse(json); 
		try {
			setup.forEach( module => {
				_.moduleCounter = Math.max(_.moduleCounter, module.id);
				try {
					var mod = _.createModule(module.x, module.y, Modules[module.type], module.id);
				} catch(e) {
					console.warn(e);
					module.invalid = true;
					console.warn("Possible that " + module.type + " is not a valid module");
					return;
				}
				mod.name = module.name || "";
				module.params.forEach( (val, ind) => {
						if(!mod.params[ind].paramLoad)
							mod.setParam(ind, val);
						else
							mod.setParam(ind, mod.params[ind].paramLoad(val));
				});

				if(module.type == "Output") {
					_.deleteModule(_.outputModule);
					_.outputModule = mod;
				}
			})
			setup.forEach( module => { 
				let targetModule = _.getModuleFromId(module.id);
				if(targetModule == undefined) return;
				module.inputs.forEach( (input,index) => { 
					if( input == null ) return;
					let sourceModule = _.getModuleFromId(input.id); 
					if( sourceModule == undefined ) return;
					sourceModule.connect(targetModule, index, input.index);
				})
			});
		} catch(e) {
			console.error("Corrupted Setup File: ", e); return;	
		}
	}

}