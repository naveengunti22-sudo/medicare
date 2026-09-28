import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.js';
import doctorRoutes from './server/routes/doctors.js';
import appointmentRoutes from './server/routes/appointments.js';
import queueRoutes from './server/routes/queue.js';
import consultationRoutes from './server/routes/consultations.js';
import prescriptionRoutes from './server/routes/prescriptions.js';
import reportRoutes from './server/routes/reports.js';
import followupRoutes from './server/routes/followups.js';
import referralRoutes from './server/routes/referrals.js';
import paymentRoutes from './server/routes/payments.js';
import reviewRoutes from './server/routes/reviews.js';
import notificationRoutes from './server/routes/notifications.js';
import adminRoutes from './server/routes/admin.js';
import aiRoutes from './server/routes/ai.js';
import { setupSocketIO } from './server/socket.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Socket.IO
  const io = setupSocketIO(httpServer);
  app.set('io', io);

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/consultations', consultationRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/followups', followupRoutes);
  app.use('/api/referrals', referralRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/ai', aiRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'MediLink Intelligent Doctor Consultation System',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Vite development vs production serving
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[MediLink] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MediLink server:', err);
  process.exit(1);
});
