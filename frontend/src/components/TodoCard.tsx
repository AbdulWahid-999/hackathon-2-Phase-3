'use client';

import React from 'react';
import { Todo } from '@/lib/api';
import { Button } from '@/components/Button';

interface TodoCardProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onToggleComplete, onDelete, onEdit }) => {
  // Determine priority styling
  const priorityClasses = {
    low: 'bg-green-500/20 text-green-400 border border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border border-red-500/30'
  };

  return (
    <div className={`p-5 mb-3 rounded-xl border transition-all duration-300 hover:shadow-lg ${
      todo.isCompleted
        ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 dark:from-green-900/20 dark:to-emerald-900/20 light:from-green-100 light:to-emerald-100 border-green-500/30 backdrop-blur-sm'
        : 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 dark:from-blue-900/20 dark:to-indigo-900/20 light:from-blue-100 light:to-indigo-100 border-blue-500/30 backdrop-blur-sm hover:from-blue-900/30 hover:to-indigo-900/30 hover:border-blue-400/50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={todo.isCompleted}
            onChange={() => onToggleComplete(todo.id)}
            className={`mt-1 h-5 w-5 rounded-full cursor-pointer transition-colors ${
              todo.isCompleted
                ? 'bg-green-500/30 border-green-500 text-green-400'
                : 'bg-gray-700/50 border-gray-600 text-cyan-500 hover:bg-cyan-500/20'
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className={`text-base font-semibold ${
                todo.isCompleted ? 'line-through text-gray-400 dark:text-gray-400 light:text-gray-600' : 'text-gray-200 dark:text-gray-200 light:text-gray-800'
              }`}>
                {todo.title}
              </h3>
              {todo.priority && (
                <span className={`text-xs px-2 py-1 rounded-full ${priorityClasses[todo.priority]}`}>
                  {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                </span>
              )}
            </div>
            {todo.description && (
              <p className={`mt-1 text-sm ${
                todo.isCompleted ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {todo.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <Button
            onClick={() => onEdit(todo)}
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors px-2 py-1"
          >
            ✏️
          </Button>
          <Button
            onClick={() => onDelete(todo.id)}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors px-2 py-1"
          >
            🗑️
          </Button>
        </div>
      </div>
    </div>
  );
};

export { TodoCard };