const express = require('express');
const cors = require('cors');
const PORT = 5000;
const app = express();
app.use(cors());
app.use(express.json());

const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
// Works as db (just for the tutorial)
const rooms = new Map();222

app.get('/', (req, res, _next) => {
  res.send('works');
});

app.post('/rooms', (req, res, _next) => {
  const { userName, roomId } = req.body; 
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map([
      ['users', new Map()],
      ['messages', []]
    ]))
  }
  res.send('rooms');
})

io.on('connection', (socket) => {
  socket.on('room joined', ({ roomId, userName }) => {
    socket.join(roomId)
    // saving data to db
    rooms.get(roomId).get('users').set(socket.id, userName);
    const users = [...rooms.get(roomId).get('users').values()];
    io.in(roomId).emit('room joined', users);
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      if(room.get('users').delete(socket.id)) { // returns true if .delete success
        const users = [...room.get('users').values()];
        socket.broadcast.to(roomId).emit('room leaved', users);
      }
    });
  });
})


server.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));