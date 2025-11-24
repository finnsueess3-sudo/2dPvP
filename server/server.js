import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const wss = new WebSocketServer({ port: 8080 });
const players = {}; // Alle Spieler

wss.on('connection', ws => {
  const playerId = randomUUID();
  players[playerId] = { id: playerId, x: 300, y: 300, dir: 0, hp: 10, energy: 100, classKey: 'mage' };

  // Sende Initialisierung an den neuen Client
  ws.send(JSON.stringify({ type: 'init', playerId, players }));

  // Nachrichten vom Client
  ws.on('message', message => {
    const data = JSON.parse(message);
    if (data.type === 'update') {
      players[playerId] = { ...players[playerId], ...data.state };
      // Broadcast an andere Spieler
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify({ type: 'state', playerId, state: data.state }));
        }
      });
    }
  });

  ws.on('close', () => delete players[playerId]);
});

console.log('Server läuft auf ws://localhost:8080');
