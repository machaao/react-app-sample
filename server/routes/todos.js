import express from 'express';
import { randomUUID } from 'crypto';
import { machaaoClient } from '../utils/machaaoClient.js';
import { authMiddleware } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Helper function to slugify keys
function slugifyKey(key) {
  return key.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all todos for user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const todosKey = slugifyKey(`todos_${userId}`);

    const result = await machaaoClient.getAppData(todosKey);

    res.json({
      success: true,
      data: result.data?.value || []
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    logger.error('Get todos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch todos'
    });
  }
});

// Create new todo
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Todo text is required'
      });
    }

    const todosKey = slugifyKey(`todos_${userId}`);
    
    // Get existing todos
    let todos = [];
    try {
      const result = await machaaoClient.getAppData(todosKey);
      todos = result.data?.value || [];
    } catch (error) {
      // No existing todos, start fresh
    }

    const newTodo = {
      id: randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    todos.unshift(newTodo);

    await machaaoClient.setAppData(todosKey, todos);

    res.status(201).json({
      success: true,
      data: newTodo
    });
  } catch (error) {
    logger.error('Create todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create todo'
    });
  }
});

// Update todo
router.put('/:id', async (req, res) => {
  try {
    const todoId = req.params.id;
    const updates = req.body;
    const userId = req.userId;
    const todosKey = slugifyKey(`todos_${userId}`);

    const result = await machaaoClient.getAppData(todosKey);
    let todos = result.data?.value || [];

    const todoIndex = todos.findIndex(t => t.id === todoId);
    
    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    todos[todoIndex] = {
      ...todos[todoIndex],
      ...updates,
      id: todoId // Prevent ID change
    };

    await machaaoClient.setAppData(todosKey, todos);

    res.json({
      success: true,
      data: todos[todoIndex]
    });
  } catch (error) {
    logger.error('Update todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update todo'
    });
  }
});

// Delete todo
router.delete('/:id', async (req, res) => {
  try {
    const todoId = req.params.id;
    const userId = req.userId;
    const todosKey = slugifyKey(`todos_${userId}`);

    const result = await machaaoClient.getAppData(todosKey);
    let todos = result.data?.value || [];

    const filteredTodos = todos.filter(t => t.id !== todoId);

    if (filteredTodos.length === todos.length) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }

    await machaaoClient.setAppData(todosKey, filteredTodos);

    res.json({
      success: true,
      message: 'Todo deleted'
    });
  } catch (error) {
    logger.error('Delete todo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete todo'
    });
  }
});

// Clear completed todos
router.delete('/completed/clear', async (req, res) => {
  try {
    const userId = req.userId;
    const todosKey = slugifyKey(`todos_${userId}`);

    const result = await machaaoClient.getAppData(todosKey);
    let todos = result.data?.value || [];

    const activeTodos = todos.filter(t => !t.completed);

    await machaaoClient.setAppData(todosKey, activeTodos);

    res.json({
      success: true,
      message: 'Completed todos cleared'
    });
  } catch (error) {
    logger.error('Clear completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear completed todos'
    });
  }
});

export default router;
