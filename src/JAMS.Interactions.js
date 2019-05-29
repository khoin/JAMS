JAMS.Interactions = {};

/**
	Collection of Interactions Windows/Menus/etc.
**/

// calls from src/InterfaceMenuBar.js
JAMS.Interactions.menuBarMenus = [
	{
		name: "File",
		callback: (interface, app, x) => {
			interface.add(
				new InterfaceContextMenu({ x: x, y: 23, padding: 8,
					options: [{
						text: "New Setup",
						callback: () => {
							let win = new InterfaceWindow({ title: "Confirm", x: 100, y: 100, w: 200, h: 70, isResizable: false	});

							win
							.appendChild(new WindowText({ content: "Confirm clearing setup?", wh: 25, ww: 1 }))
							.appendChild(new WindowButton({ content: "OK!" , callback: () => { app.newSetup(); win.close(); }, wh: 15 }))

							interface.add(win)
						}
					},{
						text: "Open Setup",
						callback: app.openSetup.bind(app)
					},{
						text: "Save Setup",
						callback: app.exportSetup.bind(app)
					},{
						text: "Preferences",
						callback: () => {
							let win = new InterfaceWindow({ title: "Preferences", x: 100, y: 100, w: 400, h: 400, isResizable: false });

							win
							.appendChild(new WindowText({ content: "◆ Persistent Preferences", fontSize: 1, wh: 40, ww: 1, align: "left" }));

							Object.keys(app.preferences.getPreference()).forEach( par => {
								entry = app.preferences.getPreference()[par];

								win.appendChild(new WindowText({
									ww: 1, wh: 30, align: "left",
									content: "-"+entry.name
								}));

								switch(entry.type) {
									case "listOptions":
										win.appendChild(new WindowListOptions({ ww: 1, wh: 30, values: entry.values,
											getValue: () => app.preferences.getItem(par),
											setValue: x => app.preferences.setItem(par, x)
										}));
									break;
									case "integerSlider":
										win.appendChild(new WindowIntegerSlider({ ww: 1, wh: 30, min: entry.min, max:entry.max, step: entry.step,
											getValue: () => app.preferences.getItem(par),
											setValue: x => app.preferences.setItem(par, x)
										}));
									break;
									case "color":
										win.appendChild(new WindowColor({ ww: 1, wh: 30,
											getValue: () => app.preferences.getItem(par),
											setValue: x => app.preferences.setItem(par, x)
										}));
									break;
									default:
										win.appendChild(new WindowText({ ww: 1, wh: 30,
											content: "<unsupported type>"
										}));
								}
							});

							win
							.appendChild(new WindowText({ content: "◆ Reset", fontSize: 1, wh: 40, ww: 1, align: "left" }))
							.appendChild(new WindowButton({ content: "Reset Preferences", wh: 20, ww: 0.5, callback: () => app.preferences.reset() }))
							.appendChild(new WindowButton({ content: "Refresh Page", wh: 20, ww: 0.5, callback: () => location.reload() }))

							interface.add(win);
						}
					}]
				})
			)
		}
	},
	{
		name: "View",
		callback: (interface, app, x) => {
			let fakeE = {clientX: innerWidth/2, clientY: innerHeight/2};
			interface.add(
				new InterfaceContextMenu({ x: x, y: 23, padding: 8,
					options: [{
						text: "Zoom In (Ctrl + Scrollup)",
						callback: () => app.desktop.scaleUp(fakeE)
					},{
						text: "Zoom Out (Ctrl + Scrolldown)",
						callback: () => app.desktop.scaleDown(fakeE)
					}]
				})
			)
		}
	},
	{
		name: "Help",
		callback: (interface, app, x) => {
			interface.add(
				new InterfaceContextMenu({ x: x, y: 23, padding: 8,
					options: [{
						text: "Examples",
						callback: () => window.open("./examples")
					},{
						text: "Bug Track",
						callback: () => window.open("https://github.com/khoin/JAMS/issues")
					},{
						text: "About",
						callback: () => {
							let win = new InterfaceWindow({ title: "About", x: 100, y: 100, w: 400, h: 170, isResizable: false});

							win
							.appendChild(new WindowText({ content: "JAMS", fontSize: 3, wh: 50, ww: 1}))
							.appendChild(new WindowText({ content: "JAMS - A Modular System", fontSize: 2, wh: 20, ww: 1}))
							.appendChild(new WindowText({ content: "Fork me at github.com/khoin/JAMS ", fontSize: 1, wh: 40, ww: 1}))
							.appendChild(new WindowButton({ content: "Repository", wh: 20, ww: 0.5, callback: () => {window.open("https://github.com/khoin/JAMS")} }))
							.appendChild(new WindowButton({ content: "Acknowledgements", wh: 20, ww: 0.5, callback: () => {window.open("./#acknowledgements")} }))
							.appendChild(new WindowPalette({ palette: app.g.palette, wh: 20, ww: 1}));

							interface.add(win);
						}
					}]
				})
			)
		}
	}
]

// calls from JAMS.js
JAMS.Interactions.rightClickOnDesktop = (_this, e, x, y, currentModule) => {
	let pluginTree = _this.plugins.map( category => { 
		return { 
			text: category.name, 
			children: category.children.map( child => {
			return {
				text: child,
				callback: () => _this.createModule(_this.desktop.mouseMapX(x), _this.desktop.mouseMapY(y), Modules[child])
			}})
		} 
	});

	_this.interface.add(
		new InterfaceContextMenu({ x: x, y: y, 
			options: [{
				text: "Add",
				children: pluginTree
			}]
		})
	)
}

JAMS.Interactions.rightClickOnModule = (_this, e, x, y, currentModule) => {
	_this.interface.add(
		new InterfaceContextMenu({ x: x, y: y,
			options: [{
				text: "Delete",
				callback: () => _this.deleteModule(currentModule)
			},{
				text: "Parameters",
				callback: () => {
					JAMS.Interactions.displayParametersWindow(_this, e, x, y, currentModule);
				}
			}]
		})
	)
}

JAMS.Interactions.displayParametersWindow = (_this, e, x, y, currentModule) => {
	let win = new InterfaceWindow({ title: `${currentModule.name} Parameters`, x: x, y: y, w: 400, h: 200, isResizable: true });

	win
	.appendChild(new WindowText({
		ww: 1/2, wh: 30, align: "left",
		content: "Module Name"
	}))
	.appendChild(new WindowTextField({
		ww: 1/2, wh: 30, 
		getValue: () => currentModule.name,
		setValue: x => currentModule.name = x
	}))

	currentModule.params.forEach( par => {
		win.appendChild(new WindowText({
			ww: 1/2, wh: 30, align: "left",
			content: par.name
		}));

		switch(par.type) {
			case "text":
				win.appendChild(new WindowTextField({ ww: 1/2, wh: 30, 
					getValue: () => par.value,
					setValue: x => par.value = x
				}))
			break;
			case "number":
				win.appendChild(new WindowNumber({ ww: 1/2, wh: 30,
					getValue: () => par.value,
					setValue: x => par.value = x
				}))
			break;
			case "boolean":
				win.appendChild(new WindowCheckBox({ ww: 1/2, wh: 30,
					getValue: () => par.value,
					setValue: x => par.value = x
				}))
			break;
			case "wavefile":
				win.appendChild(new WindowFileUpload({ ww: 1/2, wh: 30,
					extension: ".wav",
					getValue: () => x,
					setValue: x => {
						try {
							par.value = WaveReader(x);
							if (par.onload) par.onload();
						} catch(e) {
							console.error(e);
							_this.alert(e.message, "Error!");
						}
					}
				}))
			break;
			default:
				win.appendChild(new WindowText({ ww: 1, wh: 30,
					content: "<unsupported type>"
				}));
		}
	})

	_this.interface.add(win);
}
