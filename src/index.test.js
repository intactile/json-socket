import net from 'net';
import JsonSocket from './';

describe('json-socket', () => {
  let lastPort = 18252;

  const getPort = () => {
    lastPort += 1;
    return lastPort;
  };

  const createServer = (item, callback) => net.createServer((connection) => {
    if (callback) {
      callback(new JsonSocket(connection), item);
    }
  });

  const writeAndDisconnect = (socket, item) => {
    if (item !== undefined) {
      socket.write(item);
    }
    socket.disconnect();
  };

  const setupServer = (item) => {
    const server = createServer(item, writeAndDisconnect);
    const port = getPort();
    server.listen(port);

    return { server, port };
  };

  const sendRecieveJson = (item, done) => {
    const { server, port } = setupServer(item);

    const socket = new JsonSocket(port, '127.0.0.1');
    socket.on('json', (data) => {
      expect(data).toEqual(item);
      server.close();
      done();
    });
  };

  const handleError = (done) => {
    const { server, port } = setupServer();

    const socket = new JsonSocket(port, '127.0.0.1');
    socket.on('error', (e) => {
      expect(e).toBeDefined();
      server.close();
      done();
    });
    socket.on('disconnect', () => socket.write({ sending: 'after close' }));
  };

  it('should send null', (done) => {
    sendRecieveJson(null, done);
  });

  it('should send boolean', (done) => {
    sendRecieveJson(false, done);
  });

  it('should send int', (done) => {
    sendRecieveJson(0, done);
  });

  it('should send string', (done) => {
    sendRecieveJson('test', done);
  });

  it('should send array', (done) => {
    sendRecieveJson(['test', 15, [null, 0]], done);
  });

  it('should send object', (done) => {
    sendRecieveJson({ key: 'string', key2: 0, key3: [0, 10, 5] }, done);
  });

  it('should send big object', (done) => {
    const bigArray = new Array(10000).join('test ');
    sendRecieveJson({ key: bigArray }, done);
  });

  it('should connect the socket', (done) => {
    const server = createServer();
    const port = getPort();
    server.listen(port);

    const socket = new JsonSocket(new net.Socket());
    socket.connect(port, '127.0.0.1');

    socket.on('connect', () => {
      socket.disconnect();
      server.close();
      done();
    });
  });

  it('should handle error', (done) => {
    handleError(done);
  });
});
