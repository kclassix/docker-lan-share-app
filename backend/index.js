const express = require('express');
const https = require('https');
const { Server } = require('socket.io');
const getLANIP = require('./lan-ip');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// SSL cert and key
// const cert = fs.readFileSync(path.resolve('certs', 'localhost.pem'));
// const key = fs.readFileSync(path.resolve('certs', 'localhost-key.pem'));

// console.log('cert', cert)
// const httpServer = createServer({ key, cert }, app);

// const server = https.createServer({ key, cert }, app);

// server.on('clientError', (err, socket) => {
//   // console.error('Client error:', err.message);
//   socket.destroy();
// });

// const io = new Server(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//   },
// });

// io.on('connection', (socket) => {
//   console.log('Socket connected:', socket.id);
// });

// app.get('/ip', (_, res) => res.json({ ip: getLANIP() }));

// server.listen(3000, '0.0.0.0', () => {
//   console.log(`Backend running at http://${getLANIP()}:3000`);
// });


// const app = express();
// const httpServer = https.createServer({ key, cert }, app);
const httpServer = https.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const ROOM = 'screen-share-room';

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', () => {
    socket.join(ROOM);
    // Tell existing users someone new joined
    socket.to(ROOM).emit('new-viewer', socket.id);
  });

  // Screen sharer broadcasts offer to a specific viewer
  socket.on('offer', ({ target, sdp }) => {
    io.to(target).emit('offer', { from: socket.id, sdp });
  });

  // Viewer sends answer back to sharer
  socket.on('answer', ({ target, sdp }) => {
    io.to(target).emit('answer', { from: socket.id, sdp });
  });

  // ICE candidates relay
  socket.on('ice-candidate', ({ target, candidate }) => {
    io.to(target).emit('ice-candidate', { from: socket.id, candidate });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    socket.to(ROOM).emit('viewer-left', socket.id);
  });
});

app.get('/ip', (_, res) => res.json({ ip: getLANIP() }));

const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running at https://${getLANIP()}:3000`);

  // console.log(`Signaling server running on http://localhost:${PORT}`);
});
