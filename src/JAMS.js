class JAMS {
	constructor (config) {
		// stuff
		this.moduleCounter	= 0;
		this.modules 		= [];
		this.midiModules 	= [];

		this.g				= new Graphics({width: config.width, height: config.height});
		this.interface		= new Interface(this.g);
		this.desktop		= new Desktop(this.g, this.modules);
		this.mouseListeners = new ListenerList(this.g.DOMElement, ["mousedown", "mouseup", "mousemove"]);
		this.keyListeners	= new ListenerList(this.g.DOMElement, ["keydown"]);


		// Audio
		this.aC = (config.audioContext instanceof AudioContext)? config.audioContext : new AudioContext();
		window.sampleRate = this.aC.sampleRate;
		this.processor = this.aC.createScriptProcessor(0, 0, 2);
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
			children: ["Sequencer16"]
		},{
			name: "Envelopes",
			children: ["LinearDecay"]
		},{
			name: "Misc",
			children: ["QuadMixer", "Scope"]
		}];
		
		this.outputModule = this.createModule(innerWidth-100, 100, Modules.Output);
	}

	appendTo	(element) {
		this.g.appendTo(element);
		return this;
	}

	init 		() {
		let _ = this;

		this.processor.onaudioprocess = function(audioProcessingEvent) {
			var obuffer = audioProcessingEvent.outputBuffer;
			var incr = obuffer.length/_.aC.sampleRate;
			for( var ch=0; ch < obuffer.numberOfChannels; ch++ ){ 
				var odata = obuffer.getChannelData(ch);
				for(var i=0; i < obuffer.length; i++)
					odata[i] = _.audioLoop(_.t + (i/_.aC.sampleRate), ch);
			}
			_.t += incr;
		}

		// MIDI Error Window
		var mid = new MIDI((error) => {
			let win = new InterfaceWindow({
				x: ~~(innerWidth/2), y: ~~(innerHeight/2),
				w: 350, h: 100,
				title: "No MIDI"
			});

			win
			.appendChild(new WindowText({
				ww: 1, wh: 30,
				content: "Your browser does not support MIDI.",
				fontSize: 2
			}))
			.appendChild(new WindowButton({
				ww: 1, wh: 30,
				content: "Acknowledged",
				fontSize: 2,
				callback: () => win.close()
			}));

			this.interface.add(win);
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

		// rightclick
		this.g.DOMElement.addEventListener("contextmenu", e => {
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
									let win = new InterfaceWindow({ title: `${currentModule.name} Parameters`, x: x, y: y, w: 200, h: 200, isResizable: true });

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
								let win = new InterfaceWindow({ title: "About", x: x, y: y, w: 400, h: 130, isResizable: false});

								win
								.appendChild(new WindowText({ content: "JAMS", fontSize: 3, wh: 50, ww: 1}))
								.appendChild(new WindowText({ content: "JAMS - A Modular System", fontSize: 2, wh: 20, ww: 1}))
								.appendChild(new WindowText({ content: "By KhoiN ", fontSize: 1, wh: 40, ww: 1}))

								this.interface.add(win);
							}
						}]
					})
				)
			}
			
		});

		// fire rendering loop
		this.render();
	}

	render 		() {
		requestAnimationFrame(this.render.bind(this));
		this.g.background("#000");
		this.desktop.render();
		this.interface.render();
	}

	audioLoop	(t, ch) {
		this.modules.forEach( module => {
			if(module.prerun == true) module.run(t);
		});

		return this.outputModule.run(t, 1, ch);
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

		this.midiModules.some( (module,index) => {
			if(module == deletingModule) {
				_.midiModules.splice(index, 1);
				return true;
			}
		})

		this.modules.forEach( (module,id) => {
			if( module == deletingModule ) i = id;
			module.inputs.forEach( (input,index) => {
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
		this.outputModule = this.createModule(innerWidth-100, 100, Modules.Output);
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
						let saver = document.createElement("a");
						saver.download = "JAMS-"+fileName+".json";
						saver.href="data:application/json,"+this.saveSetupToJSON();
						saver.click();
					}
				})
			)
		)
	}

	openSetup() {
		setTimeout(() => { /**remove canvas drag listener**/ },100);
		var opener = document.createElement("input");
		opener.type = "file";
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

			setup.push({
				id: module.id,
				type: module.className,
				x: module.x,
				y: module.y,
				inputs: inputsArr,
				params: module.params,
				name: module.name
			})
		});
		return JSON.stringify(setup);
	}

	loadSetup		(json) {
		var _ = this;
		this.newSetup();
		//try { 
			var setup = JSON.parse(json); 
			//}
		//catch(e) { console.error("Invalid JSON.", e); return;}

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
						mod.setParam(ind, val.value);
				});

				if(module.type == "Output") {
					_.deleteModule(_.outputModule);
					_.outputModule = mod;
				}
			})
			setup.forEach( module => { 
				var targetModule = _.getModuleFromId(module.id);
				if(targetModule == undefined) return;
				module.inputs.forEach( (input,index) => { 
					if( input == null ) return;
					var sourceModule = _.getModuleFromId(input.id); 
					if( sourceModule == undefined ) return;
					sourceModule.connect(targetModule, index, input.index);
				})
			});
		} catch(e) {
			console.error("Corrupted Setup File: ", e); return;	
		}
	}

}

//JAMS.prototype.appendTo = function(element) {}
//JAMS.prototype.init = function() {}
//JAMS.prototype.render = function() {}
//JAMS.prototype.audioLoop = function(t, ch) {}
//JAMS.prototype.createModule = function(x, y, module, id) {}
//JAMS.prototype.deleteModule = function(deletingModule) {}
//JAMS.prototype.getModuleFromId = function(id) { }
//JAMS.prototype.exportSetup = function() {}
//JAMS.prototype.newSetup = function () {}
//JAMS.prototype.openSetup = function() {}
//JAMS.prototype.saveSetupToJSON = function() {}
//JAMS.prototype.loadSetup = function(json) {}