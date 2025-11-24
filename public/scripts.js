const socket = io();
const otherPlayers = {};
socket.on('currentPlayers', players => {
  for(const id in players) if(id !== socket.id) otherPlayers[id] = players[id];
});
socket.on('newPlayer', p => otherPlayers[p.id]=p);
socket.on('playerMoved', data => { if(otherPlayers[data.id]) Object.assign(otherPlayers[data.id], data); });
socket.on('playerDisconnected', id => delete otherPlayers[id]);
socket.on('spellCast', data => { /* hier Spell-Visualisierung */ });

function sendMove(x,y,dir){ socket.emit('move',{x,y,dir}); }
function sendSpell(type,x,y,dir){ socket.emit('castSpell',{type,x,y,dir}); }
