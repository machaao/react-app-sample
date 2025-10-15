import { motion } from 'framer-motion';

function Stats({ todos }) {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const active = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'Total', value: total, color: 'from-blue-500 to-blue-600', icon: '📋' },
    { label: 'Active', value: active, color: 'from-orange-500 to-orange-600', icon: '⚡' },
    { label: 'Completed', value: completed, color: 'from-green-500 to-green-600', icon: '✓' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-effect rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold mt-1 bg-gradient-to-r bg-clip-text text-transparent" style={{
                backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                '--tw-gradient-from': stat.color.split(' ')[0].replace('from-', ''),
                '--tw-gradient-to': stat.color.split(' ')[1].replace('to-', '')
              }}>
                {stat.value}
              </p>
            </div>
            <div className="text-4xl">{stat.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default Stats;
