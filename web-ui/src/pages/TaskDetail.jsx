import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { FaArrowLeft, FaTasks, FaCheck, FaPlus, FaTimesCircle, FaExclamationTriangle, FaCheckCircle, FaEdit } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

// Status icons and colors config
const statusConfig = {
  'todo': { icon: <FaTasks />, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Todo' },
  'pending': { icon: <FaTasks />, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Pending' },
  'in-progress': { icon: <FaEdit />, color: 'text-blue-500', bg: 'bg-blue-100', label: 'In Progress' },
  'review': { icon: <FaExclamationTriangle />, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Review' },
  'done': { icon: <FaCheckCircle />, color: 'text-green-500', bg: 'bg-green-100', label: 'Done' },
  'deferred': { icon: <FaTimesCircle />, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Deferred' }
};

// Priority styles
const priorityStyles = {
  'high': 'bg-red-100 text-red-800',
  'medium': 'bg-blue-100 text-blue-800',
  'low': 'bg-gray-100 text-gray-800'
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandLoading, setExpandLoading] = useState(false);
  const [expandPrompt, setExpandPrompt] = useState('');
  const [expandCount, setExpandCount] = useState(3);
  
  // Fetch task details
  const { data: task, isLoading, error } = useQuery(['task', id], async () => {
    const response = await axios.get(`/api/tasks/${id}`);
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
        queryClient.invalidateQueries(['task', id]);
        queryClient.invalidateQueries('tasks');
        queryClient.invalidateQueries('nextTask');
      }
    }
  );
  
  // Mutation for expanding a task
  const expandTaskMutation = useMutation(
    async ({ id, prompt, num }) => {
      return axios.post(`/api/tasks/${id}/expand`, { prompt, num });
    },
    {
      onSuccess: () => {
        // Clear form and invalidate queries
        setExpandPrompt('');
        queryClient.invalidateQueries(['task', id]);
        queryClient.invalidateQueries('tasks');
        setExpandLoading(false);
      },
      onError: () => {
        setExpandLoading(false);
      }
    }
  );
  
  // Handle status update
  const handleStatusUpdate = (newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };
  
  // Handle task expansion
  const handleExpandTask = (e) => {
    e.preventDefault();
    setExpandLoading(true);
    expandTaskMutation.mutate({ 
      id, 
      prompt: expandPrompt, 
      num: expandCount 
    });
  };
  
  if (isLoading) return <LoadingSpinner size="lg" />;
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-red-800 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Error Loading Task</h2>
        <p>{error.message || 'Failed to load task details. Please try again.'}</p>
        <button 
          onClick={() => navigate('/tasks')}
          className="mt-4 px-4 py-2 bg-white border border-red-500 text-red-700 rounded-md"
        >
          Back to Tasks
        </button>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg text-yellow-800 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Task Not Found</h2>
        <p>The task you're looking for does not exist or has been deleted.</p>
        <button 
          onClick={() => navigate('/tasks')}
          className="mt-4 px-4 py-2 bg-white border border-yellow-500 text-yellow-700 rounded-md"
        >
          Back to Tasks
        </button>
      </div>
    );
  }
  
  const statusInfo = statusConfig[task.status] || statusConfig.pending;
  
  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Link 
          to="/tasks"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="mr-2" /> Back to Tasks
        </Link>
      </div>
      
      {/* Task header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Task {task.id}: {task.title}
          </h1>
          
          <div className="flex gap-2 mt-2 md:mt-0 items-center">
            <span className={`badge ${priorityStyles[task.priority] || 'bg-gray-100'}`}>
              {task.priority}
            </span>
            <span className={`badge ${statusInfo.bg} ${statusInfo.color} flex items-center gap-1`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">{task.description}</p>
        
        {/* Status actions */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Change Status:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusConfig).map(([statusKey, statusVal]) => (
              <button
                key={statusKey}
                onClick={() => handleStatusUpdate(statusKey)}
                disabled={task.status === statusKey || updateStatusMutation.isLoading}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  task.status === statusKey 
                    ? `${statusVal.bg} ${statusVal.color} cursor-default` 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {statusVal.icon}
                {statusVal.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Task details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Dependencies */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Dependencies</h2>
          {task.dependencies && task.dependencies.length > 0 ? (
            <ul className="space-y-2">
              {task.dependencies.map(depId => (
                <li key={depId} className="flex items-center gap-2">
                  <Link
                    to={`/tasks/${depId}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1.5 py-1"
                  >
                    <span className="font-medium">Task {depId}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No dependencies</p>
          )}
        </div>
        
        {/* Subtasks */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Subtasks</h2>
          {task.subtasks && task.subtasks.length > 0 ? (
            <ul className="space-y-2">
              {task.subtasks.map(subtask => (
                <li key={subtask.id} className="border-b border-gray-100 last:border-b-0 pb-2 last:pb-0">
                  <div className="flex items-start gap-2">
                    <div className="pt-0.5">
                      {subtask.status === 'done' ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaTasks className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{subtask.title}</h4>
                      <p className="text-sm text-gray-600">{subtask.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="text-gray-500 italic mb-4">No subtasks yet</p>
              <form onSubmit={handleExpandTask} className="space-y-4">
                <div>
                  <label htmlFor="expandPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                    Expand this task with additional context (optional):
                  </label>
                  <textarea 
                    id="expandPrompt"
                    rows="3"
                    value={expandPrompt}
                    onChange={(e) => setExpandPrompt(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Add any additional details for AI subtask generation..."
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="expandCount" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of subtasks:
                  </label>
                  <input 
                    type="number"
                    id="expandCount"
                    min="1"
                    max="10"
                    value={expandCount}
                    onChange={(e) => setExpandCount(e.target.value)}
                    className="w-24 border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={expandLoading}
                  className="btn btn-primary"
                >
                  {expandLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-2" /> Generate Subtasks
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Implementation details and test strategy */}
      <div className="grid grid-cols-1 gap-6">
        {task.details && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Implementation Details</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
                {task.details}
              </pre>
            </div>
          </div>
        )}
        
        {task.testStrategy && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Test Strategy</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
                {task.testStrategy}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 