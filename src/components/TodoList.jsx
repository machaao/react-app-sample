import { motion } from 'framer-motion';
import TodoItem from './TodoItem';

function TodoList({ todos, onToggle, onDelete, onEdit }) {
  return (
    <motion.div
      layout
      className="space-y-3 mt-6"
    >
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </motion.div>
  );
}

export default TodoList;
