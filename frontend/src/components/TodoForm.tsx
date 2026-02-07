'use client';

import React, { useState } from 'react';
import { CreateTodoData, UpdateTodoData } from '@/lib/api';
import { Button } from '@/components/Button';

interface TodoFormProps {
  initialData?: CreateTodoData | UpdateTodoData;
  isEditing?: boolean;
  onSubmit: (data: CreateTodoData | UpdateTodoData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const TodoForm: React.FC<TodoFormProps> = ({
  initialData = { title: '', description: '', priority: 'medium' as const },
  isEditing = false,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || 'medium' as 'low' | 'medium' | 'high'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      priority: value as 'low' | 'medium' | 'high'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      priority: formData.priority
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-cyan-400">
          {isEditing ? 'Update Your Task' : 'Create New Task'}
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          {isEditing ? 'Modify your existing task' : 'Add a new task to your list'}
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
          Task Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-gray-800/80 p-3 transition-all duration-300"
          placeholder="What do you need to do?"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-gray-800/80 p-3 transition-all duration-300"
          placeholder="Add details about your task (optional)"
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handlePriorityChange}
          className="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-gray-800/80 p-3 transition-all duration-300"
        >
          <option value="low" className="bg-gray-800">Low</option>
          <option value="medium" className="bg-gray-800">Medium</option>
          <option value="high" className="bg-gray-800">High</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 py-3 rounded-lg transition-colors"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export { TodoForm };