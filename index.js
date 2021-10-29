const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
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

const rooms = {};
const imagesBaseUrl = 'https://robohash.org';

io.on('connection', (socket) => {
  socket.emit('HAND_SHAKE')

  socket.on('SET_USERS', ({ room, name }) => {
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = {
        messages: [],
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
    io.to(room).emit('SET_USERS', { room, users: rooms[room].users });
  });
  socket.on('SET_MESSAGES', ({ room, text, name }) => {
    rooms[room].messages.push({
      id: uuidv4(),
      author: name,
      text,
      image: `${imagesBaseUrl}/${name}`,
      time: moment().format('h:mm a'),
    });
    io.to(room).emit('SET_MESSAGES', rooms[room].messages);
  });
  socket.on('disconnect', function () {
    Object.keys(rooms).forEach((room) => {
      const newUsers = rooms[room]?.users.filter((user) => user.id !== socket.id);
      rooms[room].users = [...newUsers];
      socket.broadcast.to(room).emit('SET_USERS', { room, users: rooms[room].users });
    });
});
});

server.listen(5000, () => {
  console.log('listening on 5000');
});