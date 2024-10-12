const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// 채팅 메시지 저장 경로
router.post('/message', chatController.saveMessage);

// 사용자 목록 가져오기 경로
router.get('/users', chatController.getUsers);

module.exports = router;