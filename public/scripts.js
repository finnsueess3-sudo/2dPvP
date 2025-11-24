const socket = io();
const otherPlayers = {};
let projectiles = [];

socket.on('currentPlayers', (players, serverProjectiles) => {
  for(const id in players) if(id !== socket.id) otherPlayers[id] = players[id];
  projectiles = serverProjectiles;
});

socket.on('newPlayer', p => otherPlayers[p.id] = p);
socket.on('playerMoved', data => { if(otherPlayers[data.id]) Object.assign(otherPlayers[data.id], data); });
socket.on('playerDisconnected', id => delete otherPlayers[id]);
socket.on('spellCast', p => projectiles.push(p));
socket.on('playerHit', data => { if(data.id===socket.id) player.hp = data.hp; });

function sendMove(x,y,dir){ socket.emit('move',{x,y,dir}); }
function sendSpell(type,x,y,vx,vy,life,dmg,r){ socket.emit('castSpell',{type,x,y,vx,vy,life,dmg,r}); }
