import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Database
import { getDatabase } from './database/database.js';
import { runMigrations } from './database/migrator.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import rulesetRoutes from './routes/rulesets.js';
import typeRoutes from './routes/types.js';
import topicRoutes from './routes/topics.js';
import searchRoutes from './routes/search.js';
import attachmentRoutes from './routes/attachments.js';
import dashboardRoutes from './routes/dashboard.js';

// Middleware
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting Syntagma Backend...');
    
    // 1. Run database migrations first (this ensures DB is up to date)
    console.log('🔄 Checking for database migrations...');
    const migrationSuccess = await runMigrations();
    
    if (!migrationSuccess) {
      console.error('❌ Database migration failed');
      process.exit(1);
    }
    
    // 2. Initialize database connection
    console.log('🔗 Initializing database connection...');
    const db = await getDatabase();
    app.set('db', db.db); // Set the raw SQLite database object
    
    console.log('✅ Database successfully initialized and up to date');
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  }

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/rulesets', rulesetRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', attachmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Interner Serverfehler',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Etwas ist schief gelaufen'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route nicht gefunden' });
});

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
    console.log(`Gesundheitscheck: http://localhost:${PORT}/api/health`);
  });
}

// Start the application
startServer().catch(error => {
  console.error('Fehler beim Starten des Servers:', error);
  process.exit(1);
});
