import net from 'net';
import JsonSocket from './';

describe('json.socket', () => {
  it('should exposed the socket connection', () => {
    const socket = new net.Socket();
    const jsonSocket = new JsonSocket(socket);

    expect(jsonSocket.connection).toBeDefined();
  });
});
