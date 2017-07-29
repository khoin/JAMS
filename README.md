JAMS: Just A Modular System
=====

[Homepage](http://jams.systems)

![cover](/pages/cover.jpg)

A Modular System that makes use of the Web Audio API.

## Features

* Modules
	* Arithmetics (Adding, Multiplying, Modulus)
	* Sine Oscillator, with flexible Phase Modulation routing.
	* Clocks and Clock Divider
	* MIDI modules. Current version of JAMS only has MIDI note to Hertz converter. 
	* Sequencer. Increment by pulses, 16-step sequencer.
	* Switch
	* Envelopes: Attack-Decay.
	* A simple Sampler with inputs for start/end, trigger restart, and playback rate.
	* Effects: Flange, Delay
	* Miscellaneous: 4-channel sum, Oscilloscope, XY Scope, Merging L/R.
* Loading WAV files to Sampler.
* Saving samples with projects. Currently, storing at 15-bit per sample.

## Acknowledgments

JAMS would not be possible without the help and inspiration from:

* Werner Van Belle from [BpmDj](http://bpmdj.yellowcouch.org/) for tips on feedback sine phase modulation and [Flange.js](src/AudioModules/Flange.js) 
* [Audiotool](https://audiotool.com/) team and friends for motivation and inspiration for electronic music and experimental music.
* [@stagas](github.com/stagas) from [Wavepot](https://wavepot.com/) for my first playground into DSP. Some modules in JAMS have code borrowed from [OpenDSP](https://github.com/opendsp)
* my roommate for how suggestions on stereo data flow.
* [@mog](github.com/mog) from [trbl.at](trbl.at) for WebMIDI helper class.

## Other third-parties

* JAMS uses a modified/cropped version of Misaki 8x8 font. [Source](http://www.geocities.jp/littlimi/misaki.htm) [License](http://www.geocities.jp/littlimi/font.htm)
* FileSaver.js [GitHub](https://github.com/eligrey/FileSaver.js/)

## License

[MIT](LICENSE)