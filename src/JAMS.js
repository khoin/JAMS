class JAMS {
	constructor (config) {
		// stuff
		this.moduleCounter	= 0;
		this.modules 		= [];
		this.midiModules 	= [];

		this.g				= new Graphics({width: config.width, height: config.height, font: font}); //font exists because <img id=font>
		this.interface		= new Interface(this.g);
		this.desktop		= new Desktop(this.g, this.modules);
		this.mouseListeners = new ListenerList(this.g.DOMElement, ["mousedown", "mouseup", "mousemove"]);
		this.keyListeners	= new ListenerList(this.g.DOMElement, ["keydown"]);


		// Audio
		this.aC = (config.audioContext instanceof AudioContext)? config.audioContext : new AudioContext();
		window.sampleRate = this.aC.sampleRate;
		this.processor = this.aC.createScriptProcessor(2048, 0, 2);
		let splitter	= this.aC.createChannelSplitter();
		let merger		= this.aC.createChannelMerger();

		this.processor.connect(splitter);
		splitter.connect(merger, 0 , 0);
		splitter.connect(merger, 1 , 1);
		merger.connect(this.aC.destination);

		this.t = 0;

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
		
		this.outputModule = this.createModule(~~(innerWidth/2), ~~(innerHeight/2), Modules.Output);
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
				this.interface.add(
					new InterfaceContextMenu({ x: x, y: y,
						options: [{
							text: "Delete",
							callback: () => this.deleteModule(currentModule)
						},{
							text: "Parameters",
							callback: () => {
								let win = new InterfaceWindow({ title: `${currentModule.name} Parameters`, x: x, y: y, w: 400, h: 200, isResizable: true });

								win
								.appendChild(new WindowText({
									ww: 1/2, wh: 30,
									content: "Module Name"
								}))
								.appendChild(new WindowTextField({
									ww: 1/2, wh: 30, 
									getValue: () => currentModule.name,
									setValue: x => currentModule.name = x
								}))

								currentModule.params.forEach( par => {
									win.appendChild(new WindowText({
										ww: 1/2, wh: 30,
										content: par.name
									}));

									switch(par.type) {
										case "text":
											win.appendChild(new WindowTextField({
												ww: 1/2, wh: 30, 
												getValue: () => par.value,
												setValue: x => par.value = x
											}))
										break;
										case "number":
											win.appendChild(new WindowNumber({
												ww: 1/2, wh: 30,
												getValue: () => par.value,
												setValue: x => par.value = x
											}))
										break;
										case "boolean":
											win.appendChild(new WindowCheckBox({
												ww: 1/2, wh: 30,
												getValue: () => par.value,
												setValue: x => par.value = x
											}))
										break;
										case "wavefile":
											win.appendChild(new WindowFileUpload({
												ww: 1/2, wh: 30,
												extension: ".wav",
												getValue: () => x,
												setValue: x => {
													try {
														let parsed = WaveReader(x);
														par.value = parsed;
														if (par.onload) par.onload();
													} catch(e) {
														console.error(e);
														this.interface.add((new InterfaceWindow({x: 100, y:100, w: 400, h: 50, title: "Error"}))
															.appendChild(new WindowText({
																ww: 1, wh: 20,
																content: e.message
															}))
														)
													}
												}
											}))
										break;
										default:
											win.appendChild(new WindowText({
												ww: 1/2, wh: 30,
												content: "<unsupported type>"
											}));
									}
								})

								this.interface.add(win);
							}
						}]
					})
				)
			}
		} else {

			let pluginTree = this.plugins.map( category => { 
				return { 
					text: category.name, 
					children: category.children.map( child => {
					return {
						text: child,
						callback: () => this.createModule(this.desktop.mouseMapX(x), this.desktop.mouseMapY(y), Modules[child])
					}})
				} 
			});

			this.interface.add(
				new InterfaceContextMenu({ x: x, y: y, 
					options: [{
						text: "Add",
						children: pluginTree
					},{
						text: "Save Setup",
						callback: this.exportSetup.bind(this)
					},{
						text: "Open Setup",
						callback: this.openSetup.bind(this)
					},{
						text: "New Setup",
						callback: () => {
							let win = new InterfaceWindow({ title: "Confirm", x: x, y: y, w: 200, h: 70, isResizable: false	});

							win
							.appendChild(new WindowText({ content: "Confirm clearing setup?", wh: 25, ww: 1 }))
							.appendChild(new WindowButton({ content: "OK!" , callback: () => { this.newSetup(); win.close(); }, wh: 15 }))

							this.interface.add(win)
						}
					},{
						text: "About",
						callback: () => {
							let win = new InterfaceWindow({ title: "About", x: x, y: y, w: 400, h: 170, isResizable: false});

							win
							.appendChild(new WindowText({ content: "JAMS", fontSize: 3, wh: 50, ww: 1}))
							.appendChild(new WindowText({ content: "JAMS - A Modular System", fontSize: 2, wh: 20, ww: 1}))
							.appendChild(new WindowText({ content: "Fork me at github.com/khoin/JAMS ", fontSize: 1, wh: 40, ww: 1}))
							.appendChild(new WindowButton({ content: "Repository", wh: 20, ww: 0.333, callback: () => {window.open("https://github.com/khoin/JAMS")} }))
							.appendChild(new WindowButton({ content: "Acknowledgements", wh: 20, ww: 0.333, callback: () => {window.open("http://jams.systems/#acknowledgements")} }))
							.appendChild(new WindowButton({ content: "Examples", wh: 20, ww: 0.333, callback: () => {window.open("http://jams.systems/examples")} }))
							.appendChild(new WindowPalette({ palette: this.g.palette, wh: 20, ww: 1}));

							this.interface.add(win);
						}
					}]
				})
			)
		}
	}

	render 		() {
		requestAnimationFrame(this.render.bind(this));
		this.g.background("#000");
		this.desktop.render();
		this.interface.render();
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
		fetch(url).then(response => {
			if (response.ok)
				return response.text()
			this.alert("Failed loading setup from URL");
		}).then(data => {
			this.loadSetup(data);
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