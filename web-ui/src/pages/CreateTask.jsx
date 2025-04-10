import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CreateTask() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    prompt: '',
    priority: 'medium',
    dependencies: ''
  });
  
  // Mutation for creating a new task
  const createTaskMutation = useMutation(
    async (data) => {
      return axios.post('/api/tasks', data);
    },
    {
      onSuccess: (response) => {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries('tasks');
        queryClient.invalidateQueries('nextTask');
        setIsSubmitting(false);
        
        // Navigate to the new task page
        if (response.data && response.data.id) {
          navigate(`/tasks/${response.data.id}`);
        } else {
          navigate('/tasks');
        }
      },
      onError: () => {
        setIsSubmitting(false);
      }
    }
  );
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.prompt.trim()) return;
    
    setIsSubmitting(true);
    createTaskMutation.mutate(formData);
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
      </div>
      
      <div className="card max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Task Description*
            </label>
            <textarea
              id="prompt"
              name="prompt"
              rows="6"
              value={formData.prompt}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the task in detail. Claude will generate a structured task from this description."
              required
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">
              Be as detailed as possible. Include what needs to be done, any implementation details, and how to test it.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dependencies" className="block text-sm font-medium text-gray-700 mb-1">
                Dependencies (optional)
              </label>
              <input
                type="text"
                id="dependencies"
                name="dependencies"
                value={formData.dependencies}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. 1,2,3"
              />
              <p className="text-sm text-gray-500 mt-1">
                Comma-separated task IDs that this task depends on
              </p>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.prompt.trim()}
              className="btn btn-primary w-full md:w-auto"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating Task...
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" /> Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 