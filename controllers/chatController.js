var ChatHistory = require('../models/chathistory');


class chatController {
    async getChatHistoryByRoom(req, res) {
        let {
            room_id
        } = req.params;

        let chat_history = await ChatHistory.find({
            'user.room': room_id
        }).sort('date')

        res.json({
            status: true,
            result: chat_history
        })
    }
}

module.exports = chatController;