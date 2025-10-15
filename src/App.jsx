import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import FilterButtons from './components/FilterButtons';
import Stats from './components/Stats';

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTodos([newTodo, ...todos]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const editTodo = (id, newText) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <header className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2"
          >
            ✓ Beautiful Todo
          </motion.h1>
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
          <p>Built with ❤️ using React & Tailwind CSS</p>
        </footer>
      </motion.div>
    </div>
  );
}

export default App;
