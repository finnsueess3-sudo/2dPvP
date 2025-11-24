const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const players = {};

io.on('connection', (socket) => {
  console.log(`Spieler verbunden: ${socket.id}`);

  players[socket.id] = {
    x: 400,
    y: 300,
    classKey: 'mage',
    hp: 100,
    color: '#f60',
    abilities: { q:0, e:0, x:0 },
    dir:0
  };

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  socket.on('move', data => {
    if(players[socket.id]){
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      players[socket.id].dir = data.dir;
      io.emit('playerMoved', { id: socket.id, ...data });
    }
  });

  socket.on('castSpell', data => io.emit('spellCast', { id: socket.id, ...data }));

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

http.listen(3000, () => console.log('Server läuft auf http://localhost:3000'));
