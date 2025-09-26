import React, { useState, useEffect } from 'react';
import { Plus, X, CheckCircle, Circle } from 'lucide-react';

const mockFetchTasks = () => new Promise(resolve => {
  setTimeout(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    resolve({
      status: 200,
      json: () => storedTasks,
    });
  }, 500);
});

const mockSaveTasks = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 300));
}

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const response = await mockFetchTasks();

        if (response.status === 200) {
          const fetchedTasks = await response.json();
          setTasks(fetchedTasks);
        } else {
          setError('Failed to fetch tasks from the mock API.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('A network error occurred.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const text = newTaskText.trim();
    if (!text) return;

    const newTask = {
      id: Date.now(),
      text: text,
      completed: false,
    };

    const newTaskList = [...tasks, newTask];
    setTasks(newTaskList);
    setNewTaskText('');

    try {
        await mockSaveTasks(newTaskList);
    } catch (err) {
        console.error('Failed to save task:', err);
        setError('Failed to save task data.');
    }
  };

  const handleToggleTask = async (id) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    try {
        await mockSaveTasks(updatedTasks);
    } catch (err) {
        console.error('Failed to toggle task:', err);
        setError('Failed to update task data.');
    }
  };

  const handleDeleteTask = async (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);

    try {
        await mockSaveTasks(updatedTasks);
    } catch (err) {
        console.error('Failed to delete task:', err);
        setError('Failed to delete task data.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 sm:p-8 font-inter">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-xl p-6 md:p-8 mt-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b pb-3">
          Full-Stack Task Manager
        </h1>
        <p className="text-sm text-gray-500 mb-6">
            This React frontend simulates fetching and saving data to a hypothetical Node.js backend.
        </p>

        <form onSubmit={handleAddTask} className="flex space-x-3 mb-8">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
            disabled={!newTaskText.trim()}
          >
            <Plus size={20} className="mr-1" /> Add
          </button>
        </form>

        {loading && (
          <div className="flex justify-center items-center py-6 text-blue-500">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading Tasks...
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
            {error}
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <p className="text-center text-gray-500 py-10 border border-dashed rounded-lg">
            No tasks yet! Add one above.
          </p>
        )}

        {!loading && tasks.length > 0 && (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-xl shadow-sm transition duration-200 ease-in-out ${
                  task.completed ? 'bg-green-50 border-l-4 border-green-400' : 'bg-white border-l-4 border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center flex-grow min-w-0 mr-4">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="p-1 rounded-full text-gray-400 hover:text-blue-500 transition duration-150"
                    aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {task.completed ? (
                      <CheckCircle size={24} className="text-green-500" />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>
                  <span
                    className={`ml-3 text-lg font-medium truncate ${
                      task.completed ? 'line-through text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition duration-150 ml-auto"
                  aria-label="Delete task"
                >
                  <X size={20} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
