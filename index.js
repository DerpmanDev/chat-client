const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve static files from the "public" directory
app.use(express.static('public'));

// Store the connected users
const users = {};

io.on('connection', (socket) => {
  let userName;

  socket.on('join', (name) => {
    if (userName) {
      // User changing username
      const prevUserName = userName;
      userName = name;
      users[socket.id] = userName;
      socket.broadcast.emit('userChange', { prevUserName, newUserName: userName });
    } else {
      // User joining for the first time
      userName = name;
      users[socket.id] = userName;
      socket.broadcast.emit('userJoin', userName);
    }
  });

  socket.on('leave', () => {
    socket.broadcast.emit('userLeave', userName);
    delete users[socket.id];
  });

  socket.on('message', (message) => {
    io.emit('message', { user: users[socket.id], message: message });
  });

  socket.on('disconnect', () => {
    if (userName) {
      socket.broadcast.emit('userLeave', userName);
      delete users[socket.id];
    }
  });
});

http.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
