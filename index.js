const cors = require('cors');
const express = require('express');
const app = express();
app.use(cors());
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
  }
});

const rooms = {}

io.on('connection', (socket) => {
  socket.emit('HAND_SHAKE')

  socket.on('SET_USERS', ({ room, name }) => {
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = {
        users: [{
          id: socket.id,
          name,
        }]
      }
    } else {
      rooms[room].users.push({
        id: socket.id,
        name,
      });
    }
    const users = rooms[room].users.map(u => u.name);
    socket.emit('SET_USERS', { room, users });
    console.log(users);
  })
});

server.listen(5000, () => {
  console.log('listening on 5000');
});