import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Setup __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the project root directory (one level up from the web-ui directory)
const projectRoot = resolve(__dirname, '..');

// Check if task-manager.js exists
const taskManagerPath = join(projectRoot, 'scripts', 'modules', 'task-manager.js');
if (!fs.existsSync(taskManagerPath)) {
  console.error(`Error: task-manager.js not found at expected path: ${taskManagerPath}`);
  console.error('Please make sure the web-ui directory is directly inside the claude-task-master root directory.');
  process.exit(1);
}

// Load environment variables from .env file in either the current directory or parent directory
if (fs.existsSync(join(__dirname, '.env'))) {
  dotenv.config({ path: join(__dirname, '.env') });
  console.log('Loaded .env from web-ui directory');
} else if (fs.existsSync(join(projectRoot, '.env'))) {
  dotenv.config({ path: join(projectRoot, '.env') });
  console.log('Loaded .env from parent directory');
} else {
  console.warn('Warning: No .env file found in either web-ui or parent directory');
  dotenv.config(); // Try default .env location as a fallback
}

// Import web adapter instead of directly importing task-manager
import * as taskManager from '../scripts/modules/web-adapter.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json());

// Ensure dist directory exists for serving static files
const distDir = join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  // Create a simple index.html if it doesn't exist
  const indexPath = join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Claude Task Master</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>Claude Task Master API Server</h1>
          <p>This is the API server. To use the web UI, please run the client with <code>npm run web:client</code>.</p>
        </body>
      </html>
    `);
  }
}

// Serve static files from the build directory in production
app.use(express.static(distDir));

// API Routes
const apiRouter = express.Router();

// Debug helper function to log objects properly
const debugObject = (obj) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return String(obj);
  }
};

// Get all tasks
apiRouter.get('/tasks', async (req, res) => {
  try {
    console.log(`Getting tasks with projectRoot: ${projectRoot}`);
    const tasksData = await taskManager.listTasks({
      showDependencies: true,
      projectRoot: projectRoot,
    });
    res.json(tasksData);
  } catch (error) {
    console.error('Error listing tasks:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Get single task by ID
apiRouter.get('/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log(`Getting task ${taskId} with projectRoot: ${projectRoot}`);
    const taskData = await taskManager.getTask({
      id: taskId,
      projectRoot: projectRoot,
    });
    
    if (!taskData) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(taskData);
  } catch (error) {
    console.error('Error fetching task:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Update task status
apiRouter.patch('/tasks/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;
    
    if (!status || !['todo', 'in-progress', 'review', 'done', 'pending', 'blocked', 'deferred', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    console.log(`Updating task ${taskId} status to ${status} with projectRoot: ${projectRoot}`);
    await taskManager.setTaskStatus({
      id: taskId,
      status,
      projectRoot: projectRoot,
    });
    
    res.json({ success: true, message: 'Task status updated' });
  } catch (error) {
    console.error('Error updating task status:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Expand a task into subtasks
apiRouter.post('/tasks/:id/expand', async (req, res) => {
  try {
    const { prompt, num } = req.body;
    const taskId = req.params.id;
    
    console.log(`Expanding task ${taskId} with projectRoot: ${projectRoot}`);
    const expandResult = await taskManager.expandTask({
      id: taskId,
      prompt: prompt || '',
      num: num || 3,
      projectRoot: projectRoot,
    });
    
    res.json(expandResult);
  } catch (error) {
    console.error('Error expanding task:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Get next task to work on
apiRouter.get('/next-task', async (req, res) => {
  try {
    console.log(`Getting next task with projectRoot: ${projectRoot}`);
    const nextTaskData = await taskManager.getNextTask({
      projectRoot: projectRoot,
    });
    
    res.json(nextTaskData);
  } catch (error) {
    console.error('Error getting next task:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Add a new task
apiRouter.post('/tasks', async (req, res) => {
  try {
    const { prompt, priority, dependencies } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Task prompt is required' });
    }
    
    console.log(`Adding new task with projectRoot: ${projectRoot}`);
    const newTask = await taskManager.addTask({
      prompt,
      priority: priority || 'medium',
      dependencies: dependencies || '',
      projectRoot: projectRoot,
    });
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error adding task:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Mount API routes
app.use('/api', apiRouter);

// Serve React app on all other routes
app.get('*', (req, res) => {
  res.sendFile(join(distDir, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Using project root: ${projectRoot}`);
}); 