// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 클라이언트 연결 처리
const rooms = {}; // 방을 저장할 객체

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('joinRoom', (room) => {
        socket.join(room); // 방에 참가
        socket.currentRoom = room;
        console.log(`User joined room: ${room}`);
    });

    socket.on('chatMessage', (msg) => {
        const message = `${socket.username}: ${msg}`;
        io.to(socket.currentRoom).emit('chatMessage', message); // 현재 방으로 메시지 전송
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // 클라이언트 HTML 파일 제공
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});