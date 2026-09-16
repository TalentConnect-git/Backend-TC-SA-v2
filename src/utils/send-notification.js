import admin from "firebase-admin";
import { getApps, getApp } from "firebase-admin/app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount = null;
try {
  const filePath = path.join(__dirname, "../../config/firebase-service-account.json");
  if (fs.existsSync(filePath)) {
    serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } else if (process.env.FCM_SERVER_KEY) {
    serviceAccount = JSON.parse(process.env.FCM_SERVER_KEY);
  }
} catch (err) {
  console.warn("Firebase credential loading warning:", err.message);
}

if (serviceAccount && getApps().length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (initErr) {
    console.warn("Firebase initialization warning:", initErr.message);
  }
}

export const pushNotification = async ({ deviceToken, topic, condition, title, body }) => {
  try {
    if (getApps().length === 0) {
      console.warn("Push Notification Skipped: Firebase app is not initialized.");
      return null;
    }

    const hasToken = deviceToken && typeof deviceToken === 'string' && deviceToken.trim() !== '' && deviceToken !== 'null' && deviceToken !== 'undefined';
    const hasTopic = topic && typeof topic === 'string' && topic.trim() !== '';
    const hasCondition = condition && typeof condition === 'string' && condition.trim() !== '';

    const targetCount = [hasToken, hasTopic, hasCondition].filter(Boolean).length;

    if (targetCount !== 1) {
      console.warn("Push Notification Skipped: Exactly one of topic, token or condition is required.");
      return null;
    }

    const message = {
      notification: { title, body },
    };

    if (hasToken) message.token = deviceToken;
    else if (hasTopic) message.topic = topic;
    else if (hasCondition) message.condition = condition;

    return await admin.messaging().send(message);
  } catch (err) {
    console.error("Push Notification Error:", err);
    // Notification failures must NEVER cause login failure. Return null instead of throwing.
    return null;
  }
};
