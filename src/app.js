import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "../config/db.js";
import authRoutes from './routes/auth-routes.js'
import userRoutes from './routes/user-routes.js'
import schoolRoutes from './routes/school-routes.js'
import applicationRoutes from './routes/application-routes.js';
import reviewRoutes from './routes/review-routes.js'
import openAIRoutes from './routes/ai-routes.js';
import formRoutes from './routes/form-routes.js'
import otpRoutes from "./routes/otp-routes.js";
import notificationRoutes from './routes/notification-routes.js'
import ChatbotRoutes from './routes/chatbot-routes.js';
import paymentRoutes from './routes/payment-routes.js';
import { errorHandler } from './middlewares/cloudinary-error-handler.js';
import { getEntryPage } from './utils/entry-point.js';
import { getPrivacyPage } from './utils/privacy.js';

dotenv.config();
connectDB();

const app = express();

// ✅ Middleware to handle form-data correctly
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  "http://localhost:5173",   // Vite dev server
  "http://127.0.0.1:5173",
  "https://synzy.in",
  "https://www.synzy.in",
  "https://school.synzy.in",
  "https://college.synzy.in"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server / postman

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed for this origin"));
      }
    },
    credentials: true,
  })
);


//Routes for the API calls
app.get('/', (req, res) => {
    res.send(getEntryPage());
});
app.get('/privacy', (req, res) => {
    res.send(getPrivacyPage());
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', schoolRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/form', formRoutes);
app.use('/api', openAIRoutes);
app.use('/api/chatbot',ChatbotRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/payments", paymentRoutes);

app.use(errorHandler);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


app.use((err, req, res, next) => {
    console.error("Global Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: err.toString()
    });
});