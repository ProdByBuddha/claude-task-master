import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

// Status options
const STATUS_OPTIONS = [
  { value: 'in-progress', label: 'Start Working', color: 'bg-blue-600 hover:bg-blue-700' },
  { value: 'review', label: 'Mark for Review', color: 'bg-orange-600 hover:bg-orange-700' },
  { value: 'done', label: 'Mark as Done', color: 'bg-green-600 hover:bg-green-700' }
];

export default function NextTask() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch next task
  const { data, isLoading, error } = useQuery('nextTask', async () => {
    const response = await axios.get('/api/next-task');
    return response.data;
  });
  
  // Mutation for updating task status
  const updateStatusMutation = useMutation(
    async ({ id, status }) => {
      return axios.patch(`/api/tasks/${id}/status`, { status });
    },
    {
      onSuccess: () => {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries('nextTask');
        queryClient.invalidateQueries('tasks');
      }
    }
  );
  
  // Handle status update
  const handleStatusUpdate = (status) => {
    if (!data || !data.id) return;
    updateStatusMutation.mutate({ id: data.id, status });
  };
  
  if (isLoading) return <LoadingSpinner size="lg" />;
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-red-800 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Error Loading Next Task</h2>
        <p>{error.message || 'Failed to load next task. Please try again.'}</p>
        <button 
          onClick={() => navigate('/tasks')}
          className="mt-4 px-4 py-2 bg-white border border-red-500 text-red-700 rounded-md"
        >
          Browse All Tasks
        </button>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="card text-center py-12 max-w-3xl mx-auto">
        <FaCheckCircle className="mx-auto text-5xl text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done!</h2>
        <p className="text-gray-600 mb-6">
          There are no pending tasks that are ready to work on.
          All tasks are either completed or blocked by dependencies.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/tasks" className="btn btn-secondary">
            Browse All Tasks
          </Link>
          <Link to="/create-task" className="btn btn-primary">
            Create New Task
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Next Task to Work On</h1>
      
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-500">Task {data.id}</span>
              <span className={`badge ${
                data.priority === 'high' ? 'bg-red-100 text-red-800' :
                data.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {data.priority}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{data.title}</h2>
          </div>
          
          <Link
            to={`/tasks/${data.id}`}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            View Details <FaArrowRight className="ml-1" />
          </Link>
        </div>
        
        <p className="text-gray-700 mb-6">{data.description}</p>
        
        {data.dependencies && data.dependencies.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Dependencies:</h3>
            <div className="flex flex-wrap gap-2">
              {data.dependencies.map(dep => (
                <Link
                  key={dep}
                  to={`/tasks/${dep}`}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  Task {dep}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-4">Take Action</h3>
          <div className="flex flex-wrap gap-3">
            {STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleStatusUpdate(option.value)}
                disabled={updateStatusMutation.isLoading}
                className={`btn text-white ${option.color}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {data.details && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-3">Implementation Details</h3>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
              {data.details}
            </pre>
          </div>
        </div>
      )}
      
      {data.testStrategy && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Test Strategy</h3>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
              {data.testStrategy}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 