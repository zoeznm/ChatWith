const Message = require('../models/messageModel');
const User = require('../models/userModel');

// 채팅 메시지 저장
const saveMessage = async (req, res) => {
    const { username, message } = req.body;
    try {
        const newMessage = new Message({ username, message });
        await newMessage.save();
        res.status(201).send('Message saved');
    } catch (err) {
        res.status(500).send('Error saving message');
    }
};

// 사용자 목록 가져오기
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).send('Error fetching users');
    }
};

module.exports = {
    saveMessage,
    getUsers
};