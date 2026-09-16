import Notification from '../models/notifications-model.js';
import { pushNotification } from '../utils/send-notification.js';
import Auth from '../models/auth-model.js';
import mongoose from 'mongoose';

// 1. Create a new notification
export const createNotificationService = async ({ authId, title, body, path, notificationType, data }) => {
  const newNotification = new Notification({
    authId: new mongoose.Types.ObjectId(authId),
    title,
    body,
    path,
    notificationType,
    data,
  });

  const auth = await Auth.findById(new mongoose.Types.ObjectId(authId));
  if (!auth) throw { status: 404, message: 'User not found for notification' };
  await newNotification.save();

  console.log("device token", auth.deviceToken);
  if (auth.deviceToken) {
    await pushNotification({ deviceToken: auth.deviceToken, title: title, body: body });
  }
  return newNotification;
};

// 2. Get notifications for a user (with pagination)
export const getNotificationsService = async ({ authId, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  // Fetch notifications with pagination
  const notifications = await Notification.find({ authId: new mongoose.Types.ObjectId(authId) })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for frontend pagination controls
  const totalCount = await Notification.countDocuments({ authId: new mongoose.Types.ObjectId(authId) });

  return {
    notifications,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

// 3. Mark single notification as read
export const markNotificationAsReadService = async ({ notificationId }) => {
  const notification = await Notification.findByIdAndUpdate(
    new mongoose.Types.ObjectId(notificationId),
    { is_read: true },
    { new: true }
  );

  if (!notification) {
    throw { status: 404, message: 'Notification not found' };
  }

  return notification;
};

// 4. Mark all notifications as read for a user
export const markAllNotificationsAsReadService = async ({ authId }) => {
  const notifications = await Notification.updateMany(
    { authId: new mongoose.Types.ObjectId(authId), is_read: false },
    { $set: { is_read: true } }
  );

  return notifications;
};
