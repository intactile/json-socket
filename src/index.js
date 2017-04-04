import net from 'net';
import util from 'util';
import events from 'events';

function JsonSocket(...args) {
  const socket = this;
  let connection = null;
  let json = '';

  if (args[0] instanceof net.Socket) {
    connection = args[0];
  } else {
    connection = net.connect(...args);
  }

  socket.connection = connection;

  connection.on('data', data => {
    const str = data.toString();
    const parts = str.split('\0');
    json += parts.shift();

    while (parts.length > 0) {
      socket.emit('json', JSON.parse(json));
      json = parts.shift();
    }
  });

  connection.on('connect', () => socket.emit('connect'));

  connection.on('close', () => socket.emit('close'));

  connection.on('end', () => socket.emit('disconnect'));

  connection.on('error', e => socket.emit('error', e));

  socket.write = data => connection.write(`${JSON.stringify(data)}\0`);

  socket.disconnect = () => connection.destroy();

  socket.connect = (...connectionArgs) => connection.connect(...connectionArgs);
}

util.inherits(JsonSocket, events.EventEmitter);

export default JsonSocket;
