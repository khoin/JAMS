class Graphics {
	constructor		(config) {
		this.config = config || 
		{
			width : 300,
			height: 300
		}; 

		this.DOMElement  = document.createElement("canvas");
			this.DOMElement.width  = config.width;
			this.DOMElement.height = config.height;

		this.context     = this.DOMElement.getContext("2d");
	}

	static lD () {
		return {	
			"\n": 1, "." : -2113929216	, "-" : 1073741855,		"+" : 4357252,
			" " : 2, "," : -1038024704	, "'": -2147481536,		"*" : 5189,
			"A" : 589284910		, "a" : -1261127680		, "0" : 488298030,
			"B" : 521651759		, "b" : -1902863327		, "1" : 474091716,
			"C" : 487622190		, "c" : -1676625920		, "2" : 1042424366,
			"D" : 521717295		, "d" : -1667974904		, "3" : 488124974,
			"E" : 1041728575	, "e" : -1059021786		, "4" : 554203697,
			"F" : 35095615		, "f" : -1039098834		, "5" : 520633407,
			"G" : 488408622		, "g" : -561568466		, "6" : 488160302,
			"H" : 589284913		, "h" : -1835754463		, "7" : 35791391,
			"I" : 1010962575	, "i" : -1943992318		, "8" : 488159790,
			"J" : 488129055		, "j" : -1001254780		, "9" : 487540270,
			"K" : 580101681		, "k" : -1840139231		, "%" : 572662304,
			"L" : 1041269793	, "l" : -1337847676		, "/" : 69341448,
			"M" : 588961649		, "m" : 593143808		,
			"N" : 589092465		, "n" : -1835755520		,
			"O" : 488162862		, "o" : -1936418816		,
			"P" : 35112495		, "p" : -1038899929		,
			"Q" : 748340782		, "q" : -259578578		,
			"R" : 588760623		, "r" : -2112579584		,
			"S" : 520553534		, "s" : -1066133466		,
			"T" : 138547359		, "t" : -1740490624		,
			"U" : 488162865		, "u" : -1131109376		,
			"V" : 145278513		, "v" : -2041273344		,
			"W" : 599442993		, "w" : 358269952		,
			"X" : 581052977		, "x" : -1838898176		,
			"Y" : 521094705		, "y" : -830003927		,
			"Z" : 1042419999	, "z" : -1641923584
		};
	}

	appendTo		(parent) {
		if ( parent instanceof Element ) parent.appendChild(this.DOMElement);
	}

	background 		(color) {
		this.context.fillStyle = color;
		this.context.fillRect(0,0, this.config.width, this.config.height);
	}

	point			(x, y) {
		this.context.fillRect(x,y,1,1);
	}

	// point with variable size
	point2			(x, y, f) {
		this.context.fillRect(x,y,f||1, f||1);
	}

	// bresenham, taken from here: https://rosettacode.org/wiki/Bitmap/Bresenham%27s_line_algorithm#JavaScript
	// this code is gplv3
	line			(x0, y0, x1, y1) {
		x0 |= 0; x1 |= 0; y0 |= 0; y1 |= 0; 
		const dx = Math.abs(x1-x0);
		const dy = Math.abs(y1-y0);
		let sx = x0 < x1 ? 1 : -1;
		let	sy = y0 < y1 ? 1 : -1;
		let err = (dx > dy ? dx : -dy) /2;
		while ( !(x0 == x1 && y0 == y1) ) {
			this.point(x0, y0);
			let e2 = err;
			if (e2 > -dx) {
				err -= dy;
				x0 += sx;
			}
			if (e2 < dy) {
				err += dx;
				y0 += sy;
			}
		}
	}

	box				(x, y, w, h) {
		x|=0; y|=0; w |=0; h|=0;
		this.context.strokeRect(x+0.5, y+0.5, w, h);
	}

	// 5x6 pixel font.
	text			(x, y, txt, f = 1) {
		x |= 0 ; y |= 0;
		let _ = this;
		let lD = Graphics.lD();
		let y0 = 0, x0 = 0;

		[...txt.toString()].forEach(ltr => {
			let i = 0;
			let d = lD[ltr] || 0x3FFFFFFF; 
			let spacing = ( d < 0 ) ? 5 : 6;
			
			if ( d === 1 ) { y0 += 10 * f; x0 = 0; return; }
			if ( d === 2 ) { x0 += 2 * f; return; }
			if ( d & 0x40000000 ) { i += 10; d &= 0x3FFFFFFF; }

			d <<= 1;
			while (d >>= 1) { 
				if (d & 1) _.point2(x + x0 + f*(i%5), y + y0 + f*~~(i/5), f);
				i++;
			}

			x0 += spacing*f;
		});
	}

	// returns [width, height] in pixels
	static textSize		(txt, f = 1) {
		let numLines = 1;
		let lD = this.lD();

		return [
			[...txt].map(k => {
					if (lD[k] === 1) {numLines++; return 0;}
					else if (lD[k] === 2) return 2*f;
					else return f*(6-(lD[k]<0)); 
				}).reduce((a,b) => a+b),
			f*(10*numLines - 3)
		];
	}

}