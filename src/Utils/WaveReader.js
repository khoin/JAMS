// x binary from FileReader
// returns [leftChannel as Float32Array, rightChannel as F32A, sampleRate]
// only support 16-bit pcm

function WaveReader(x) {
	if (x.substr(8,8) !== "WAVEfmt ") 
		throw new Error("Not a WAV File")
	if (x.charCodeAt(20) !== 0x01)
		throw new Error("Unsupported WAV format");
	if (x.charCodeAt(34) !== 0x10)
		throw new Error("Unsupported Bit-Depth. 16-bit please.")

	const numChan 	= x.charCodeAt(22);
	const sampleR8 	= x.charCodeAt(24) + (x.charCodeAt(25) << 8);
	const bitRate		= x.charCodeAt(34) + (x.charCodeAt(35) << 8);
	const startPoint 	= x.indexOf("data") + 8;
	const chunkLength	= x.substr(startPoint-4, 4).split("").reduce( (a,n,i) => a + (n.charCodeAt(0) << (i*8)), 0);
	const chanLength	= Math.min(180 * sampleRate, chunkLength/(bitRate/8)/numChan);

	const leftChan	= new Float32Array(chanLength);
	const rightChan	= new Float32Array(chanLength);

	/**
	console.log(`
		numChan: ${numChan}
		sampleRate: ${sampleR8}
		bitRate: ${bitRate}
		duration: ${chanLength/sampleRate} seconds
	`);
	**/
	const range = 0x1 << (bitRate - 1);

	for (let i = 0; i < chanLength; i++) {
		let sampIncr	= bitRate/8;
		let blocOffs	= sampIncr * numChan * i;
		leftChan[i]	= x	.substr(startPoint + blocOffs, sampIncr)
							.split("")
							.reduce((a,n,j) => a + (n.charCodeAt(0) << (j*8)), 0);
		leftChan[i] = leftChan[i] & 0x8000? leftChan[i]/range - 2 : leftChan[i] / range;

		if (numChan == 2) {
			rightChan[i] = (x.substr(startPoint + blocOffs + sampIncr, sampIncr)
							.split("")
							.reduce((a,n,j) => a + (n.charCodeAt(0) << (j*8)), 0) ) ;
			rightChan[i] = rightChan[i] & 0x8000? rightChan[i]/range - 2 : rightChan[i] / range;
		} else {
			rightChan[i] = leftChan[i];
		}

	}
	return [leftChan, rightChan, sampleR8];
}

// 15-bit 16384
function WaveParamSave(data) {
	let left = "";
	let right = "";

	for (let i = 0; i < data[0].length; i++) {
		left +=  String.fromCharCode( ~~((data[0][i] + 1) * 16384) );
		right += String.fromCharCode( ~~((data[1][i] + 1) * 16384) );
	}

	return [left, right, data[2]];
}

function WaveParamLoad(data) {
	let left = new Float32Array(data[0].length);
	let right = new Float32Array(left.length);

	for (let i = 0; i < data[0].length; i++) {
		left[i] = (data[0].charCodeAt(i)-16384)/16384;
		right[i]= (data[1].charCodeAt(i)-16384)/16384;
	}

	return [left, right, data[2]];
}
