import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import FilterButtons from './components/FilterButtons';
import Stats from './components/Stats';
import AuthForm from './components/AuthForm';
import { apiClient } from './utils/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          await loadTodos();
          setIsAuthenticated(true);
        } catch (error) {
          // Session expired or invalid
          apiClient.logout();
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const loadTodos = async () => {
    try {
      const response = await apiClient.getTodos();
      setTodos(response.data || []);
    } catch (error) {
      console.error('Error loading todos:', error);
      throw error;
    }
  };

  const handleAuth = async (formData) => {
    setAuthError('');
    try {
      if (isLogin) {
        await apiClient.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        await apiClient.register(formData);
      }
      
      await loadTodos();
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError(error.message || 'Authentication failed. Please try again.');
      throw error;
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    setIsAuthenticated(false);
    setTodos([]);
    setAuthError('');
  };

  const addTodo = async (text) => {
    try {
      const response = await apiClient.createTodo(text);
      setTodos([response.data, ...todos]);
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Failed to add todo. Please try again.');
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      await apiClient.updateTodo(id, { completed: !todo.completed });
      setTodos(todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
      alert('Failed to update todo. Please try again.');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await apiClient.deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete todo. Please try again.');
    }
  };

  const editTodo = async (id, newText) => {
    try {
      await apiClient.updateTodo(id, { text: newText });
      setTodos(todos.map(t =>
        t.id === id ? { ...t, text: newText } : t
      ));
    } catch (error) {
      console.error('Error editing todo:', error);
      alert('Failed to edit todo. Please try again.');
    }
  };

  const clearCompleted = async () => {
    try {
      await apiClient.clearCompleted();
      setTodos(todos.filter(t => !t.completed));
    } catch (error) {
      console.error('Error clearing completed:', error);
      alert('Failed to clear completed todos. Please try again.');
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <AuthForm
          onSubmit={handleAuth}
          isLogin={isLogin}
          onToggleMode={() => {
            setIsLogin(!isLogin);
            setAuthError('');
          }}
          error={authError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              ✓ Beautiful Todo
            </motion.h1>
            <div className="flex-1 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                Logout
              </motion.button>
            </div>
          </div>
          <p className="text-gray-600">Organize your tasks with style</p>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-6 mb-6"
        >
          <TodoInput onAdd={addTodo} />
        </motion.div>

        <Stats todos={todos} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-2xl p-6"
        >
          <FilterButtons
            currentFilter={filter}
            onFilterChange={setFilter}
            onClearCompleted={clearCompleted}
            hasCompleted={todos.some(todo => todo.completed)}
          />

          <AnimatePresence mode="wait">
            <TodoList
              todos={filteredTodos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          </AnimatePresence>

          {filteredTodos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-400 text-lg">
                {filter === 'completed' && todos.length > 0
                  ? '🎉 No completed tasks yet!'
                  : filter === 'active' && todos.length > 0
                  ? '✨ All tasks completed!'
                  : '📝 Add your first task to get started'}
              </p>
            </motion.div>
          )}
        </motion.div>

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Built with &hearts; using React &amp; Tailwind CSS</p>
        </footer>
      </motion.div>
    </div>
  );
}

export default App;
