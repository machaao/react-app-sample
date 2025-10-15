import { motion } from 'framer-motion';

function FilterButtons({ currentFilter, onFilterChange, onClearCompleted, hasCompleted }) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' }
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex gap-2">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentFilter === filter.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </motion.button>
        ))}
      </div>

      {hasCompleted && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClearCompleted}
          className="text-red-500 hover:text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
        >
          Clear Completed
        </motion.button>
      )}
    </div>
  );
}

export default FilterButtons;
