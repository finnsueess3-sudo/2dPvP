const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const players = {};
let projectiles = [];

io.on('connection', (socket) => {
  console.log(`Spieler verbunden: ${socket.id}`);

  // Spieler initialisieren
  players[socket.id] = {
    x: 400,
    y: 300,
    classKey: 'mage',
    hp: 100,
    color: '#f60',
    dir: 0,
    abilities: { q:0, e:0, x:0 },
    r: 14
  };

  socket.emit('currentPlayers', players, projectiles);
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  // Bewegung
  socket.on('move', data => {
    if(players[socket.id]){
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      players[socket.id].dir = data.dir;
      io.emit('playerMoved', { id: socket.id, ...data });
    }
  });

  // Spell cast
  socket.on('castSpell', data => {
    if(!players[socket.id]) return;
    const p = {
      id: socket.id,
      type: data.type,
      x: data.x,
      y: data.y,
      vx: data.vx || 0,
      vy: data.vy || 0,
      life: data.life || 1,
      dmg: data.dmg || 1,
      r: data.r || 6
    };
    projectiles.push(p);
    io.emit('spellCast', p);
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

// Server Tick: Update Projektile & Schaden
setInterval(()=>{
  const dt = 1/60;

  for(let i=projectiles.length-1;i>=0;i--){
    const p = projectiles[i];
    p.x += (p.vx||0)*dt;
    p.y += (p.vy||0)*dt;
    if(p.life) p.life -= dt;
    if(p.life <=0) { projectiles.splice(i,1); continue; }

    // Schaden prüfen
    for(const id in players){
      if(id === p.id) continue; // Eigene nicht treffen
      const pl = players[id];
      const d = Math.hypot(pl.x-p.x, pl.y-p.y);
      if(d < pl.r + p.r){
        pl.hp -= p.dmg;
        if(pl.hp<0) pl.hp=0;
        io.emit('playerHit', { id, hp: pl.hp });
        projectiles.splice(i,1);
        break;
      }
    }
  }
}, 1000/60);

http.listen(3000, () => console.log('Server läuft auf http://localhost:3000'));
