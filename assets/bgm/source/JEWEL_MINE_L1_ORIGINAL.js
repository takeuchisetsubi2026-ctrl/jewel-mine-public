// Extracted from original FEVER L-series AppBlock (jmfl), 2026-11-09.
// Original musical data and synthesis parameters; NOT an Android-integrated audio file.
const E=(...a)=>a.map(x=>Array.isArray(x)?x:[x,1]);
const L1={name:'L1',bpm:174,mode:0,bars:[
E(77,77,80,77,84,80,77,75),
E(75,75,79,82,79,75,74,75),
E(80,80,84,87,84,80,77,80),
E(79,82,79,77,75,74,[77,2]),
E(84,84,87,84,89,87,84,82),
E(82,82,86,89,86,82,79,82),
E(87,87,92,89,87,84,82,80),
E(79,80,79,77,75,74,[77,2])
],ch:[[53,56,60],[51,55,58],[53,56,60],[50,54,57],[53,56,60],[51,55,58],[50,54,57],[53,56,60]],bass:[41,39,41,38,41,39,38,41]};
// Original FEVER L-series audio-engine scheduling parameters for L1 (mode=0):
// eighth-note unit=30/bpm; lead: sawtooth, gain .078, lowpass 3000Hz;
// lead duration=unit*noteDuration*.88;
// chords: triangle, gain .016, each voice staggered .011s, duration unit*6.4;
// bass: sawtooth, gain .098, lowpass 1450Hz, every second step, duration unit*1.48;
// bass at step%8==6 is +7 semitones; extra square bass octave +12, gain .014;
// kick every fourth step and at step%8==3 or 7; snare step%4==2; hat odd steps;
// kick sine 155->43Hz over .12s, gain .17; snare noise highpass 1550Hz gain .063;
// hat noise highpass 6300Hz gain .018. Master volume UI default 55/100 * .44.
