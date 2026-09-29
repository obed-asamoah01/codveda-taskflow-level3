// socket.js
// ---------
// Thin factory that creates and returns a Socket.io-client connection.
// Passing { auth: { token } } in the options object makes the JWT
// available as socket.handshake.auth.token on the server side, where
// the io.use() middleware verifies it before allowing the connection.

import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

/**
 * Connect to the Socket.io server with the given JWT.
 * @param {string} token – the JWT stored in localStorage after login.
 * @returns {Socket} a connected socket.io-client instance.
 */
export const connectSocket = (token) =>
  io(SOCKET_URL, {
    auth: { token },  // sent in the handshake; verified by io.use() on the server
  });
