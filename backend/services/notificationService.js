const Notification = require('../models/Notification');
const { emitToUser } = require('../sockets');

const notifyUser = async ({ userId, type, message, bookingId }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      booking: bookingId,
    });

    emitToUser(userId, 'notification:new', {
      id: notification._id,
      type: notification.type,
      message: notification.message,
      bookingId: notification.booking,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (err) {
    console.error(`Notification failed: ${err.message}`);
    return null;
  }
};

module.exports = { notifyUser };