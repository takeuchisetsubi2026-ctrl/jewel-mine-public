// Extracted from original N-series AppBlock (jmn14), 2026-11-09.
// Original musical data and synthesis parameters; NOT an Android-integrated audio file.
const E=(...a)=>a.map(x=>Array.isArray(x)?x:[x,1]);
const N1={name:'N1',bpm:154,wave:'triangle',bars:[
E(79,79,84,86,null,84,81,79),
E(81,84,86,88,86,84,81,84),
E(86,86,91,88,null,86,84,81),
E(84,86,88,86,[84,2],[81,1],[84,1]),
E(84,84,88,91,null,88,86,84),
E(86,88,91,93,91,88,86,88),
E(91,93,95,93,91,88,86,88),
E(91,88,86,84,[83,1],[81,1],[84,2])
],ch:[[60,64,67],[55,59,62],[57,60,64],[60,64,67],[60,64,67],[65,69,72],[57,60,64],[60,64,67]],bass:[48,43,45,48,48,41,45,48]};
// Original N-series audio-engine scheduling parameters:
// eighth-note unit=60/bpm/2; lead: triangle, gain .105, lowpass 5200 Hz;
// at steps divisible by 4: sine octave below lead, gain .014;
// chords: sine, gain .015, each voice staggered .012s, duration unit*5.9;
// bass: triangle, gain .078, every second step, duration unit*1.6;
// bass last note (step%8==6) is +7 semitones;
// kick every fourth step (step%4==0), snare at step%4==2, hat odd steps.
// kick sine 145->46Hz over .13s, gain .14; snare noise highpass 1350Hz gain .048;
// hat noise highpass 5700Hz gain .013. Master volume UI default 65/100 * .65.
