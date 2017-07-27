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

		this.palette = ["#000", "#FFF", "#FF0", "#F0F", "#0FF", "#0F8", "#F80", "#F08"];
		this.currentColor = 1;

		this.font = config.font; //bitmap
		this.fontMap = " 、。,.·:;?!゛°´`¨^￣＿ヽヾゝゞ〃仝々〆〇ー－-/\\～‖|…‥‘’“”()〔〕[]{}〈〉《》「」『』【】+-±×÷=≠<>≦≧∞∴♂♀゜′″℃¥$¢£%#%*@§☆★◆□■△▲▽▼※〒→←↑↓〓           ∈∋⊆⊇⊂⊃∩∪        ∧∨¬⇒⇔∀∃           ∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬       Å‰♯♭♪†‡¶ 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz                            ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをん       ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ    ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ        αβγδεζηθικλμνξοπρςστυφχψω                                 АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ               абвгдеёжзийклмнопрстуфхцчшщъыьэюя         ─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂";
		this.fontSet = [];

		this.loadFont();
	}

	loadFont () {
		// generate font set
		let dummyCanvas = document.createElement("canvas"); dummyCanvas.width = this.font.width; dummyCanvas.height = this.font.height;
		let dummyContxt = dummyCanvas.getContext("2d");
		let SIZE = 8*3; //8;
		let promises = [];
		for (let i = 0 ; i < this.palette.length; i++ ) {
			//to rgb 0-255
			let rgb = [0,0,0].map((x,k) => {
				return (parseInt(this.palette[i].substr(1,3),16) >> 4*(2-k) & 0xF)*17 ;
			});
			// draw bitmap somewhere to get image data
			dummyContxt.drawImage(this.font, 0, 0);
			let bitmap = dummyContxt.getImageData(0, 0, this.font.width, this.font.height);
			let data = bitmap.data;
			// coloring
			for (let j = 0; j < data.length; j += 4 ) {
				if (data[j+3] == 255) {
					data[j]   = rgb[0];
					data[j+1] = rgb[1];
					data[j+2] = rgb[2];
				}	
			}
			//create bitmaps
			let out = [];
			for (let j = 0; j < 720; j++) {
				out.push(createImageBitmap(bitmap,(j%90)*SIZE,~~(j/90)*SIZE, SIZE, SIZE));
			}
			let lilprom = Promise.all(out).then(bitmaps => {
				this.fontSet.push(bitmaps);
			});
			promises.push(lilprom);
		}
		Promise.all(promises).then( () => {
			// 2DContext.drawImage will throw an error, so we copy this method when all bitmap finishes resolving.
			this.text = this.text_;
		});
	}

	setColor 		(number) {
		this.context.fillStyle = this.context.strokeStyle = this.palette[number%this.palette.length];
		this.currentColor = number%this.palette.length;
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

	text () {}
	text_			(x, y, txt, f = 1) {
		x |= 0; y |= 0;
	
		let x0 = 0; let y0 = 0;
		[...txt.toString()].forEach(ltr => {
			if (ltr == '\n' && (y0 += 8)) 
				return x0 = 0;

			let index = this.fontMap.indexOf(ltr);
			if (index == -1) return x0+=7;
			this.context.drawImage(this.fontSet[this.currentColor][index], x + x0*f, y + y0*f, 8*f, 8*f);
			x0 += 8;
		});
		
	}

	// returns [width, height] in pixels
	static textSize	(txt, f = 1) {
		let width = txt.length * 8 * f;
		let height = 8;
		for (let i = 0; i < txt.length; i++)
			height += txt.charAt(i) == "\n"? 8 : 0;
		return [width, height];
	}
}