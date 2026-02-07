'use client';

import { useState, useEffect } from 'react';
import { Todo, CreateTodoData, UpdateTodoData } from '@/lib/api';
import { todoApi } from '@/lib/api';
import { TodoCard } from '@/components/TodoCard';
import { TodoForm } from '@/components/TodoForm';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/Footer';

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  const { user, loading: authLoading } = useAuth();

  // Fetch todos on component mount and update progress
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const fetchedTodos = await todoApi.getTodos();
        setTodos(fetchedTodos);

        // Calculate progress percentage
        const completedCount = fetchedTodos.filter(todo => todo.isCompleted).length;
        const totalCount = fetchedTodos.length;
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        setProgressPercentage(progress);
      } catch (err) {
        setError('Failed to load todos');
        console.error('Error fetching todos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchTodos();
    }
  }, [authLoading]);

  // Update filtered todos and progress percentage whenever todos change
  useEffect(() => {
    // Apply filters
    let result = [...todos];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      result = result.filter(todo => todo.priority === filterPriority);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed') {
        result = result.filter(todo => todo.isCompleted);
      } else if (filterStatus === 'pending') {
        result = result.filter(todo => !todo.isCompleted);
      }
    }

    setFilteredTodos(result);

    // Calculate progress percentage based on original todos
    const completedCount = todos.filter(todo => todo.isCompleted).length;
    const totalCount = todos.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    setProgressPercentage(progress);
  }, [todos, searchTerm, filterPriority, filterStatus]);

  const handleCreateTodo = async (data: CreateTodoData | UpdateTodoData) => {
    try {
      // Type assertion to ensure required fields for creation
      const createData = {
        title: (data as CreateTodoData).title,
        description: (data as CreateTodoData).description,
        priority: (data as CreateTodoData).priority || 'medium'
      };

      const newTodo = await todoApi.createTodo(createData as CreateTodoData);
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);

      // Calculate new progress percentage
      const completedCount = updatedTodos.filter(t => t.isCompleted).length;
      const totalCount = updatedTodos.length;
      const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // Update progress state
      setProgressPercentage(newProgress);

      setShowForm(false);
    } catch (err) {
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
    }
  };

  const handleUpdateTodo = async (id: string, data: UpdateTodoData) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, data);
      const updatedTodos = todos.map(todo => (todo.id === id ? updatedTodo : todo));
      setTodos(updatedTodos);

      // Calculate new progress percentage
      const completedCount = updatedTodos.filter(t => t.isCompleted).length;
      const totalCount = updatedTodos.length;
      const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // Update progress state
      setProgressPercentage(newProgress);

      setEditingTodo(null);
      setShowForm(false);
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await todoApi.deleteTodo(id);
        const updatedTodos = todos.filter(todo => todo.id !== id);
        setTodos(updatedTodos);

        // Calculate new progress percentage
        const completedCount = updatedTodos.filter(t => t.isCompleted).length;
        const totalCount = updatedTodos.length;
        const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Update progress state
        setProgressPercentage(newProgress);
      } catch (err) {
        setError('Failed to delete todo');
        console.error('Error deleting todo:', err);
      }
    }
  };

  const handleToggleComplete = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      try {
        const updatedTodo = await todoApi.updateTodo(id, {
          isCompleted: !todo.isCompleted
        });

        // Update the todos list with the updated todo
        const updatedTodos = todos.map(t => (t.id === id ? updatedTodo : t));
        setTodos(updatedTodos);

        // Calculate new progress percentage based on the updated todos
        const completedCount = updatedTodos.filter(t => t.isCompleted).length;
        const totalCount = updatedTodos.length;
        const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Update progress state
        setProgressPercentage(newProgress);
      } catch (err) {
        setError('Failed to update todo status');
        console.error('Error updating todo status:', err);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated (this would typically be handled by a higher-level auth guard)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Please log in to access the dashboard</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 shadow-2xl md:mb-8 md:p-8">
          <h1 className="text-2xl font-bold text-gray-200 mb-2 md:text-3xl md:mb-4">
            Your Todo Dashboard
          </h1>
          <p className="text-gray-300 text-sm md:text-lg">Welcome, <span className="font-semibold text-cyan-400">{user?.email}</span></p>
          <p className="text-gray-500 text-xs md:text-sm">Manage your tasks efficiently</p>
        </div>

        {/* Progress Section */}
        <div className="mb-6 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 dark:from-blue-900/30 dark:to-indigo-900/30 light:from-blue-100 light:to-indigo-100 backdrop-blur-sm p-4 rounded-2xl border border-blue-500/30 dark:border-blue-500/30 light:border-blue-300 shadow-lg animate-fadeIn md:mb-8 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-3 md:mb-4">
            <h2 className="text-lg font-semibold text-gray-200 dark:text-gray-200 light:text-gray-800 mb-2 sm:mb-0">Your Progress</h2>
            <span className="text-cyan-400 font-bold text-lg md:text-xl">{progressPercentage}%</span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-5 mb-3 overflow-hidden md:h-6 md:mb-4">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-700 ease-out shadow-lg shadow-cyan-500/30"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="bg-gray-800/50 dark:bg-gray-800/50 light:bg-white/80 p-3 rounded-lg border border-gray-700 dark:border-gray-700 light:border-gray-300 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 light:hover:border-cyan-400 transition-all duration-300">
              <div className="text-2xl text-cyan-400 dark:text-cyan-400 light:text-cyan-600 mb-1">📋</div>
              <p className="text-xl font-bold text-cyan-400 dark:text-cyan-400 light:text-cyan-700">{todos.length}</p>
              <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-700">Total Tasks</p>
            </div>
            <div className="bg-gray-800/50 dark:bg-gray-800/50 light:bg-white/80 p-3 rounded-lg border border-gray-700 dark:border-gray-700 light:border-gray-300 hover:border-green-500/50 dark:hover:border-green-500/50 light:hover:border-green-400 transition-all duration-300">
              <div className="text-2xl text-green-400 dark:text-green-400 light:text-green-600 mb-1">✅</div>
              <p className="text-xl font-bold text-green-400 dark:text-green-400 light:text-green-700">{todos.filter(t => t.isCompleted).length}</p>
              <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-700">Completed</p>
            </div>
            <div className="bg-gray-800/50 dark:bg-gray-800/50 light:bg-white/80 p-3 rounded-lg border border-gray-700 dark:border-gray-700 light:border-gray-300 hover:border-yellow-500/50 dark:hover:border-yellow-500/50 light:hover:border-yellow-400 transition-all duration-300">
              <div className="text-2xl text-yellow-400 dark:text-yellow-400 light:text-yellow-600 mb-1">⏳</div>
              <p className="text-xl font-bold text-yellow-400 dark:text-yellow-400 light:text-yellow-700">{todos.filter(t => !t.isCompleted).length}</p>
              <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-700">Pending</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-red-900/50 p-3 border border-red-500/50 backdrop-blur-sm md:mb-4 md:p-4">
            <div className="text-xs text-red-300 md:text-sm">{error}</div>
          </div>
        )}

        <div className="mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 md:gap-4 md:mb-4">
            <h2 className="text-lg font-semibold text-gray-200 dark:text-gray-200 light:text-gray-800">Your Todos</h2>
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingTodo(null);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm py-2 px-4 md:py-3 md:px-6"
            >
              Add New Todo
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search todos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-gray-800/80 p-2 text-sm transition-all duration-300 md:p-3"
              />
            </div>

            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-gray-800/80 p-2 text-sm transition-all duration-300 md:p-3"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-gray-800/80 p-2 text-sm transition-all duration-300 md:p-3"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {showForm && !editingTodo && (
          <div className="mb-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm p-4 rounded-2xl border border-purple-500/30 shadow-lg md:mb-6 md:p-6">
            <h3 className="text-base font-medium text-gray-200 mb-3 md:text-lg md:mb-4">Create New Todo</h3>
            <TodoForm
              onSubmit={handleCreateTodo}
              onCancel={() => setShowForm(false)}
              isLoading={false}
            />
          </div>
        )}

        {editingTodo && (
          <div className="mb-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm p-4 rounded-2xl border border-purple-500/30 shadow-lg md:mb-6 md:p-6">
            <h3 className="text-base font-medium text-gray-200 mb-3 md:text-lg md:mb-4">Edit Todo</h3>
            <TodoForm
              initialData={{
                title: editingTodo.title,
                description: editingTodo.description || '',
                priority: editingTodo.priority
              }}
              isEditing={true}
              onSubmit={(data) => handleUpdateTodo(editingTodo.id, data)}
              onCancel={() => setEditingTodo(null)}
              isLoading={false}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="text-gray-400 text-sm">Loading todos...</div>
          </div>
        ) : todos.length === 0 ? (
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 text-center">
            <h3 className="text-base font-medium text-gray-200 mb-2">No todos yet</h3>
            <p className="text-gray-400 mb-3 text-sm">Get started by creating your first todo!</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm py-2 px-4"
            >
              Create Your First Todo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {filteredTodos.map(todo => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTodo}
                onEdit={(todo) => {
                  setEditingTodo(todo);
                  setShowForm(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 md:mt-12">
        <Footer />
      </div>
    </div>
  );
}