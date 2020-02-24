import { initialize, Endpoint, Self } from '@muzilator/sdk'

const pattern = [60, 64, 67];
const MidiEvents = [
  {
    "type": "note-on",
    "pitch": 60,
    "velocity": 100,
    "timestamp": 0
  }, 
  {
    "type": "note-on",
    "pitch": 64,
    "velocity": 100,
    "timestamp": 0
  }, 
  {
    "type": "note-on",
    "pitch": 67,
    "velocity": 100,
    "timestamp": 0
  },
  {
    "type": "note-off",
    "pitch": 60,
    "velocity": 100,
    "timestamp": 0.5
  }, 
  {
    "type": "note-off",
    "pitch": 64,
    "velocity": 100,
    "timestamp": 0.5
  }, 
  {
    "type": "note-off",
    "pitch": 67,
    "velocity": 100,
    "timestamp": 0.5
  }
]

const init = async () => {
  const platform = await initialize()
  var patternRecognition = await platform.createChannel('pattern-recognition')
  var sequenceChannel = await platform.createChannel('sequence')

  // load Controller, MIDI-Synth, Analyzer and Sequence Player.
  await platform.loadLibrary('bubbles-vanilla-example', 'bubbles', 'primary')
  await platform.loadLibrary('midi-synth', 'synth')
  await platform.loadLibrary('chord-analyzer', 'analyzer')
  await platform.loadLibrary('sequence-player', 'sequence-player')

  // Connect Channels (see attached Diagram)
  await platform.connectChannels(Endpoint('bubbles', 'midi'), Endpoint('synth', 'midi'))
  await platform.connectChannels(Endpoint('bubbles', 'midi'), Endpoint('analyzer', 'midi'))
  await platform.connectChannels(Endpoint('analyzer', 'analysis-control'), Self('pattern-recognition'))
  await platform.connectChannels(Self('pattern-recognition'), Endpoint('analyzer', 'analysis-control'))
  await platform.connectChannels(Self('sequence'), Endpoint('sequence-player', 'midi'))
  await platform.connectChannels(Endpoint('sequence-player', 'midi'), Endpoint('synth', 'midi'))

  patternRecognition.postMessage({type: 'set-pattern', pattern: pattern});
  
  // handle event when pattern recognized
  patternRecognition.addEventListener('message', message => {
    if (message.data.type === 'pattern-recognized') {
      console.log('Pattern Recognized!');
      // play DoMajor Twice with 1 second timeout between the iterations
      sequenceChannel.postMessage({type: 'play-pattern', sequence: MidiEvents})
      setTimeout(() => {sequenceChannel.postMessage({type: 'play-pattern', sequence: MidiEvents})}, 1000)
    }
  });
  
  // Dont forget - always activate your channels.
  patternRecognition.start();
  sequenceChannel.start();
}

init()
