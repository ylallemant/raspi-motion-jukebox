'use strict';

var fs = require('fs');
var async = require('async');
var player = require('play-sound')({});
var mp3Duration = require('mp3-duration');
var PiMotion = require('node-pi-motion');

var options = {
    verbose: true,
    sensitivity: 200,
    threshold: 20,
    sleep: 0.2
}

var nodePiMotion = new PiMotion(options);

nodePiMotion.on('DetectedMotion', function() {
    console.log('Motion detected!');
    if (!playLoop) playOneSound();
});


var playLoop = null;
var playlist = [];
var sounds = [];
var tasks  = [];


function scannSounds() {
    // load all tracks information
    require('fs').readdirSync(__dirname + '/sounds').forEach(function (filename) {
        console.log('  - ', filename);
        tasks.push(function (callback) {
            mp3Duration(__dirname + '/sounds/' + filename, function (err, duration) {
                if (err) {
                    console.error(__dirname + '/sounds/' + filename, err);
                } else {
                    sounds.push({
                        path: __dirname + '/sounds/' + filename,
                        duration: duration * 1000
                    });
                }

                callback()
            });
        });
    });

    async.waterfall(tasks, (error, data) => {
        console.log('Sounds scanned...');
    });
}
scannSounds();

function trueRandom(min, max) {
    return Math.floor(Math.random() * (max - min +1)) + min;
}

function playOneSound() {
    if (playLoop) {
        // already playing - do nothing
        console.log('already playing - do nothing');
        return;
    }

    if (!playlist || !playlist.length) {
        playlist = [].concat(sounds);
        scannSounds();
    }

    var indexMin = 0;
    var indexMax = playlist.length - 1;
    var soundIndex = trueRandom(indexMin, indexMax);
    var sound = playlist.splice(soundIndex, 1)[0];
    var delay = sound.duration + 2000;

    console.log('playback', sound.path);
    player.play(sound.path, { timeout: sound.duration }, function (err) {
        if (err) console.error(sound.path, 'playback', err);
    });

    playLoop = setTimeout(() => {
            clearTimeout(playLoop);
            playLoop = null;
            console.log('waiting for motion...');
        },
        delay
    );
}
