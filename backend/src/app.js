import express from 'express';
import cors from 'cors';
const app = express();

// Middleware
app.use(express.json());
app.use(cors({origin: 'http://localhost:5173' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok'});
});

export default app;