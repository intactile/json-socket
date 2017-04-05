import net from 'net';
import { EventEmitter } from 'events';

class JsonSocket extends EventEmitter {
  constructor(...args) {
    super();

    this.json = '';
    this.connection = (args[0] instanceof net.Socket) ? args[0] : net.connect(...args);
    this.handleData = this.handleData.bind(this);

    this.connection.on('data', this.handleData);
    this.connection.on('connect', () => this.emit('connect'));
    this.connection.on('close', () => this.emit('close'));
    this.connection.on('end', () => this.emit('disconnect'));
    this.connection.on('error', e => this.emit('error', e));
  }

  handleData(data) {
    const parts = data.toString().split('\0');
    this.json += parts.shift();

    while (parts.length > 0) {
      this.emit('json', JSON.parse(this.json));
      this.json = parts.shift();
    }
  }

  write(data) {
    this.connection.write(`${JSON.stringify(data)}\0`);
  }

  disconnect() {
    this.connection.destroy();
  }

  connect(...connectionArgs) {
    this.connection.connect(...connectionArgs);
  }
}

export default JsonSocket;
