const config = require('./config');

const chalk = require('chalk');
const debug = require('debug')('app');

const express = require('express');
const app = express();

const httpServer = require('http').Server(app);
const socketIO = require('socket.io')(httpServer);

const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (_req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

socketIO.on('connection', socket => {
    socket.on('join', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('connected', userId);

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('disconnected', userId);
        });
    });
});

httpServer.listen(config.http.port, '0.0.0.0', () => {
    debug(`HTTP listening at ${chalk.cyan(config.http.port)}`);
});
