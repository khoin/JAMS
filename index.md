---
layout: default
title: JAMS - Just A Modular System
---

**JAMS** is a **J**ust **A** **M**odular **S**ystem written in Javascript, and runs in your Web browser. It currently makes use of the deprecating Web Audio's [ScriptProcessorNode](https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode). Check out the GitHub [repo](https://github.com/khoin/JAMS)!

Please lower your speaker/headphones volume before opening the app.

![cover](/pages/cover.jpg)
_JAMS as of 2017, July 29th_

# Usage & Development

I originally created this with the intention of arbitrary phase modulation between different sine oscillators. It now has sequencing, envelopes, switches and sampling. You can make some cool noises out of it. The old version had an interface module with MIDI; I will bring it back in this version as well as MPE integration. 

See the [Development History](/history).

# Examples & Documentation

A list of examples per modules and per concepts is available in the [Examples](/examples) section.

[Documentation](/docs) for each module is also available.

# Acknowledgments

JAMS would not be possible without the help and inspiration from:

* Werner Van Belle from [BpmDj](http://bpmdj.yellowcouch.org/) for tips on feedback sine phase modulation and Flange.
* [Audiotool](https://audiotool.com/) team and friends for motivation and inspiration for electronic music and experimental music.
* @stagas from [Wavepot](https://wavepot.com/) for my first playground into DSP. Some modules in JAMS have code borrowed from [OpenDSP](https://github.com/opendsp).
* my roommate for suggestions on stereo data flow.