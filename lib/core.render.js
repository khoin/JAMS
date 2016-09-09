/**
	I don't like documentations :<
**/

var Render = function(config) {
	if( !(this instanceof Render) ) return new Render(config);

	this.config = config || 
				{
					width : 300,
					height: 300
				}; 

	this.DOMElement  = document.createElement("canvas");
			this.DOMElement.width  = config.width ;
			this.DOMElement.height = config.height;

	this.context     = this.DOMElement.getContext("2d");
}

Render.prototype.appendTo = function(parent) {
	if ( parent instanceof Element ) parent.appendChild(this.DOMElement);
}

Render.prototype.background = function(color) { 
	this.context.fillStyle = color;
	this.context.fillRect(0,0, this.config.width, this.config.height);
}

Render.prototype.setStrokeColor = function(color) {
	this.context.strokeStyle = color;
}

Render.prototype.point = function(x, y) {
	this.context.fillRect(x,y,1,1);
}
Render.prototype.fillPoint = function(x,y,f) {
	this.context.fillRect(x,y,f||1, f||1);
}

// Referred http://rosettacode.org/wiki/Bitmap/Bresenham%27s_line_algorithm#JavaScript
Render.prototype.line = function(x0, y0, x1, y1) {
x0 |= 0; x1 |= 0; y0 |= 0; y1 |= 0; 
	var dx = Math.abs(x1-x0),
        sx = x0 < x1 ? 1 : -1;
    var dy = Math.abs(y1-y0),
        sy = y0 < y1 ? 1 : -1;
    var err = (dx > dy ? dx : -dy) /2;
    while ( !(x0 == x1 && y0 == y1) ) {
        this.point(x0, y0);
        var e2 = err
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

Render.prototype.box = function(x, y, w, h) {
	x|=0; y|=0; w |=0; h|=0;
	
	this.context.strokeRect(x+0.5, y+0.5, w, h);
}

Render.prototype.textData = function(char) {
	switch(char.toLowerCase()) {
		case '\'':
			return [2,2];
		case ':':
			return [0,2,0,2];
		case '%':
			return [5,1,2,4,5];
		case '<':
			return [1,2,4,2,1];
		case '>':
			return [4,2,1,2,4];
		case '(':
			return [2,4,4,4,2];
		case ')':
			return [2,1,1,1,2];
		case '!':
			return [2,2,2,0,2];
		case '?':
			return [7,1,2,0,2];
		case '.':
			return [0,0,0,0,4];
		case ',':
			return [0,0,0,2,4];
		case '-':
			return [0,0,7];
		case '+':
			return [0,2,7,2];
		case '=':
			return [0,7,0,7];
		case '*':
			return [5,2,5];
		case '/':
			return [1,1,2,4,4];
		case ' ':  
			return [0];
		case 'a':
			return [6,5,7,5,5];
		case 'b':
			return [6,5,6,5,6];
		case 'c':
			return [3,4,4,4,3];
		case 'd':
			return [6,5,5,5,6];
		case 'e':
			return [7,4,6,4,7];
		case 'f':
			return [7,4,6,4,4];
		case 'g':
			return [3,4,5,5,3];
		case 'h':
			return [5,5,7,5,5];
		case 'i':
			return [7,2,2,2,7];
		case 'j':
			return [3,1,1,5,2];
		case 'k':
			return [5,5,6,5,5];
		case 'l':
			return [4,4,4,4,7];
		case 'm':
			return [5,7,5,5,5];
		case 'n':
			return [6,5,5,5,5];
		case 'o':
			return [2,5,5,5,2];
		case 'p':
			return [6,5,6,4,4];
		case 'q':
			return [2,5,5,6,3];
		case 'r':
			return [6,5,6,5,5];
		case 's':
			return [3,4,6,1,6];
		case 't':
			return [7,2,2,2,2];
		case 'u':
			return [5,5,5,5,7];
		case 'v':
			return [5,5,5,5,2];
		case 'w':
			return [5,5,5,7,5];
		case 'x':
			return [5,5,2,5,5];
		case 'y':
			return [5,5,2,2,2];
		case 'z':
			return [7,1,2,4,7];
		case '0':
			return [7,5,5,5,7];
		case '1':
			return [6,2,2,2,2];
		case '2':
			return [6,1,2,4,7];
		case '3':
			return [6,1,6,1,6];
		case '4':
			return [5,5,7,1,1];
		case '5':
			return [7,4,6,1,6];
		case '6':
			return [7,4,7,5,7];
		case '7':
			return [7,1,1,2,4];
		case '8':
			return [7,5,7,5,7];
		case '9':
			return [7,5,7,1,7];
		case '\n':
			return [8];
		default:
			return [7,7,7,7,7];
	}
}

Render.prototype.text = function(x,y, txt, f) {
	txt = txt.toString();
	x|=0; y|=0;
	x0 = x;
	f = f||1;
	var _ = this;

	[...txt].forEach(function(ltr) {
		(_.textData(ltr)).forEach(function (row, index) {
			if( row == 8 ) { y += 6*f; x = x0-4*f; }
			if( row >> 2 & 0x1 ) _.fillPoint(x, y+index*f,f);
			if( row >> 1 & 0x1 ) _.fillPoint(x+1*f, y+index*f,f);
			if( row >> 0 & 0x1 ) _.fillPoint(x+2*f, y+index*f,f);
		});
		x += 4*f;
	});
}
