const events = require('events');

const eventEmitter = new events.EventEmitter();

eventEmitter.on('connection', () => {
  console.log('call eventEmitter connection');
});

eventEmitter.emit('connection');
