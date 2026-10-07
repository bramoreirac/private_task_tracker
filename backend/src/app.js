import express from 'express';
import cors from 'cors';
import { requireAuth } from './middleware/requireAuth.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({origin: 'http://localhost:5173' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok'});
});

app.use('/api/tasks', requireAuth)

export default app;
