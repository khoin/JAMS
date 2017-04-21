class ListenerList {
	constructor		(object, events) {
		if(!(object instanceof Element)) throw new TypeError("Object is not a DOM Element");
		this.executors	= [];
		// Should consider Sorted Map for these reasons:
		// * No name conflicts
		// * Prioritizing listeners
		// Sticking with this for now.

		for (let event of events) 
			object.addEventListener(event, this.run.bind(this));

		return this;
	}

	add				(type, func, binder, status = true) {
		if(!(func instanceof Function)) throw new TypeError("listener is not a function");

		this.executors.push({
			s	: status, 
			t	: type,
			f	: func,
			_	: binder
		});
	}

	turnOn			(name) {
		for (let exe of this.executors)
			if ( exe.f.name == name ) {
				exe.s = true;
				break;
			}
	}

	turnOff			(name) { 
		for (let exe of this.executors)
			if ( exe.f.name == name ) { 
				exe.s = false;
				break;
			}
	}

	run				(e) {
		for (let i = 0, a = true; a !== false && i < this.executors.length; i++) {
			const exe = this.executors[i];
			if(exe.s && e.type == exe.t)
				a = exe.f.call(exe._, e, this);
		}
	}

}