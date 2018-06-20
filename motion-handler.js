'use strict';

var PiMotion = require('node-pi-motion');
 
var options = {
  verbose: true,
  sensitivity: 200,
threshold: 20,
sleep: 0.2
}
 
var nodePiMotion = new PiMotion(options);
 
nodePiMotion.on('DetectedMotion', function() {
  console.log('Motion detected! Now do something.');
});

