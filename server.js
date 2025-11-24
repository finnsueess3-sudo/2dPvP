const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // HTML/JS liegt in public/

// Spielerzustand
const players = {};

io.on('connection', socket => {
    console.log('Spieler verbunden:', socket.id);

    // Neuen Spieler erzeugen
    players[socket.id] = {x:100, y:100, hp:10, class:'knight', dir:0};

    // Sende allen Spielern die aktuelle Liste
    io.emit('players', players);

    // Spielerbewegung
    socket.on('move', data => {
        if(players[socket.id]){
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].dir = data.dir;
        }
        io.emit('players', players);
    });

    // Aktion/Attacke
    socket.on('attack', data => {
        // z.B. Projektil oder Dash
        io.emit('attack', {id: socket.id, ...data});
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('players', players);
    });
});

http.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
