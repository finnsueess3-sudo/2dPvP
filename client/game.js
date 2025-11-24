const ws = new WebSocket('ws://localhost:8080');
let playerId, remotePlayers = {};

ws.onmessage = e => {
  const data = JSON.parse(e.data);
  if(data.type === 'init') {
    playerId = data.playerId;
    remotePlayers = data.players;
  }
  if(data.type === 'state'){
    remotePlayers[data.playerId] = data.state;
  }
};

// Spieler Input
function sendPlayerState() {
  const state = { x: player.x, y: player.y, dir: player.dir, hp: player.hp, energy: player.energy };
  ws.send(JSON.stringify({ type: 'update', state }));
}

// Energy-Regeneration
function updatePlayer(dt){
  const p = remotePlayers[playerId];
  if(!p) return;
  p.energy = Math.min(p.energy + 10*dt, 100); // 10 Energie/sec
  sendPlayerState();
}
