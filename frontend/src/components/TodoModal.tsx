'use client';

import React from 'react';
import { CreateTodoData, UpdateTodoData } from '@/lib/api';
import { TodoForm } from '@/components/TodoForm';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTodoData | UpdateTodoData) => void;
  initialData?: CreateTodoData | UpdateTodoData;
  isEditing?: boolean;
  isLoading?: boolean;
}

const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-xl rounded-2xl border border-blue-500/50 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-blue-500/30">
            <h3 className="text-xl font-bold text-cyan-400">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-cyan-400 transition-colors p-1 rounded-full hover:bg-gray-700/50"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <TodoForm
            initialData={initialData}
            isEditing={isEditing}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export { TodoModal };