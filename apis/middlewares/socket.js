let Notification = require('../models/notification');

// sendNotification is for one to one
const sendNotification = async (req, users, data) => {
    if (users) {
        let notificationData = [];

        users.forEach(userId => {
            notificationData.push({
                'receiver_id': userId,
                'message': data.message
            });
            req.io.emit('notification_to_' + userId,
                {
                    data: {
                        message: data.message,
                        isTrigger: false
                    }
                })
        });
        if (notificationData) {
            await Notification.insertMany(notificationData);
        }
        return true;
    }
}
const sendNotificationToAllConnected = async (req, data) => {
    req.app.get('socket').broadcast.emit("broadcast_all_users", {
        data: {
            message: data.message
        }
    });
    return true;

}

module.exports = {
    sendNotification, sendNotificationToAllConnected
}
