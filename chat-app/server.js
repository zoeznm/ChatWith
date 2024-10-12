const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const path = require("path"); // 경로 모듈 추가
require("dotenv").config(); // .env 파일에서 환경 변수 로드

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB 모델 불러오기
const Message = require("./models/messageModel");
const User = require("./models/userModel");

// MongoDB 연결
mongoose
  .connect("mongodb://localhost:27017/mydatabase")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// 클라이언트에 HTML 파일 제공
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 방을 저장할 객체
const rooms = {};

// 클라이언트 연결 처리
io.on("connection", (socket) => {
  console.log("New user connected");

  // 방 참가 처리
  socket.on("joinRoom", async (data) => {
    const { username, room } = data;

    socket.join(room); // 방에 참가
    socket.username = username;
    socket.currentRoom = room;

    // 사용자 정보 저장
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
    }

    console.log(`User ${username} joined room: ${room}`);

    // 현재 방에 있는 사용자에게 입장 메시지 전송
    socket.broadcast
      .to(room)
      .emit("chatMessage", `${username} has joined the room`);

    // 해당 방의 이전 채팅 메시지를 클라이언트로 전송
    const messages = await Message.find({ room }).sort({ timestamp: 1 });
    socket.emit("previousMessages", messages);
  });

  // 메시지 전송 처리
  socket.on("chatMessage", async (msg) => {
    const messageData = {
      username: socket.username,
      message: msg,
      room: socket.currentRoom,
    };

    // 메시지를 MongoDB에 저장
    const newMessage = new Message(messageData);
    await newMessage.save();

    // 현재 방으로 메시지 전송
    io.to(socket.currentRoom).emit("chatMessage", messageData);
  });

  // 연결 해제 처리
  socket.on("disconnect", () => {
    console.log("User disconnected");
    if (socket.currentRoom) {
      socket.broadcast
        .to(socket.currentRoom)
        .emit("chatMessage", `${socket.username} has left the room`);
    }
  });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
