class InterfaceSprinkles extends InterfaceElement {
	constructor	(con) {
		super(con);
		this.x = this.y = 0;
		this.mx = this.my = 0;

		this.bucket = [];
		this.bypassMouseDown = true;
		this.i = 0;
	}

	eMouseMove	(e) {
		if( this.i % 3 == 0)
			this.bucket.unshift(
				[
				~~(e.clientX + (Math.random()-Math.random())*20), 
				~~(e.clientY + (Math.random()-Math.random())*20), 
				Math.random()*360, 
				0
				]);
		if (this.bucket.length > 70) this.bucket.pop();
		this.i++;
	}

	render		(g) {
		for ( let j = 0; j < this.bucket.length; j++) {
			let p = this.bucket[j];
			let k = p[3] % 8;
			g.context.fillStyle = `hsl(${p[2]}, 100%, 90%)`;
			
			g.point2(p[0], p[1], 2);
			if (k < 4) {
				g.point2(p[0]-2, p[1], 2);
				g.point2(p[0]+2, p[1], 2);
			} else {
				g.point2(p[0], p[1]-2, 2);
				g.point2(p[0], p[1]+2, 2);
			}

			p[1] += 8;
			p[3]++;
		}
	}
}