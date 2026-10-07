import express from 'express';
import cors from 'cors';
import { requireAuth } from './middleware/requireAuth.js';
import { createTaskClient } from './lib/createTaskClient.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({origin: process.env.FRONTEND_ORIGIN }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok'});
});

app.use('/api/tasks', requireAuth);

app.get('/api/tasks', async (req, res) => {
  try {
    const supabase = createTaskClient(req.accessToken);
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, completed, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        error: { code: 'database_error', message: 'Could not load tasks' },
      });
    }

    return res.json({ tasks: data });
  } catch {
    return res.status(500).json({
      error: { code: 'internal_error', message: 'Unexpected server error' },
    });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const body = req.body;
    const validShape =
      body &&
      typeof body === 'object' &&
      !Array.isArray(body) &&
      Object.keys(body).length === 1 &&
      typeof body.title === 'string';

    if (!validShape) {
      return res.status(400).json({
        error: { code: 'invalid_task', message: 'Provide only a title string' },
      });
    }

    const title = body.title.trim();
    if (title.length < 1 || title.length > 200) {
      return res.status(400).json({
        error: { code: 'invalid_task', message: 'Title must be 1 to 200 characters' },
      });
    }

    const supabase = createTaskClient(req.accessToken);
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, user_id: req.user.id })
      .select('id, title, completed, created_at')
      .single();

    if (error) {
      return res.status(500).json({
        error: { code: 'database_error', message: 'Could not create task' },
      });
    }

    return res.status(201).json({ task: data });
  } catch {
    return res.status(500).json({
      error: { code: 'internal_error', message: 'Unexpected server error' },
    });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id);
    if (!isUuid) {
      return res.status(400).json({
        error: { code: 'invalid_task', message: 'Invalid task ID' },
      });
    }

    const validShape =
      req.body &&
      typeof req.body === 'object' &&
      !Array.isArray(req.body) &&
      Object.keys(req.body).length === 1 &&
      typeof req.body.completed === 'boolean';

    if (!validShape) {
      return res.status(400).json({
        error: { code: 'invalid_task', message: 'Provide only a completed boolean' },
      });
    }

    const supabase = createTaskClient(req.accessToken);
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: req.body.completed })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id, title, completed, created_at')
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: { code: 'database_error', message: 'Could not update task' },
      });
    }

    if (!data) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Task not found' },
      });
    }

    return res.json({ task: data });
  } catch {
    return res.status(500).json({
      error: { code: 'internal_error', message: 'Unexpected server error' },
    });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id);
    if (!isUuid) {
      return res.status(400).json({
        error: { code: 'invalid_task', message: 'Invalid task ID' },
      });
    }

    const supabase = createTaskClient(req.accessToken);
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: { code: 'database_error', message: 'Could not delete task' },
      });
    }

    if (!data) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Task not found' },
      });
    }

    return res.status(204).end();
  } catch {
    return res.status(500).json({
      error: { code: 'internal_error', message: 'Unexpected server error' },
    });
  }
});

export default app;
