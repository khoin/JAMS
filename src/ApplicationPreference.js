class ApplicationPreference {
	constructor () {
		this.defaultPreference = {
			bufferSize: {
				name: "Audio Buffer Size (restart to take effect)",
				type: "listOptions",
				value: 2048,
				values: [256, 512, 1024, 2048, 4096, 8192]
			},
			fpsFactor : {
				name: "FPS Reduction Factor (for laggy audio)",
				type: "integerSlider",
				value: 1,
				max: 5,
				min: 1,
				step: 1
			},
			background : {
				name: "Desktop Background Color",
				type: "color",
				value: "#000"
			}
		}

		if (window.localStorage.getItem("JAMSPreference") == null)
			localStorage["JAMSPreference"] = JSON.stringify(this.defaultPreference);
	}

	getPreference () {
		return JSON.parse(localStorage.getItem("JAMSPreference"));
	}

	setItem (name, value) {
		let newPref = this.getPreference();
		newPref[name].value = value;
		localStorage["JAMSPreference"] = JSON.stringify(newPref);
	}

	getItem (name) {
		return JSON.parse(localStorage.getItem("JAMSPreference"))[name].value;
	} 

	reset () {
		localStorage["JAMSPreference"] = JSON.stringify(this.defaultPreference);
	}
}