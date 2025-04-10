import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { FaPlus, FaFilter, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskCard from '../components/TaskCard';

export default function TaskList() {
  // State for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch all tasks
  const { data, isLoading, error } = useQuery('tasks', async () => {
    const response = await axios.get('/api/tasks');
    return response.data;
  });
  
  // Filter tasks based on status, priority, and search query
  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return [];
    
    return data.tasks.filter(task => {
      // Status filter
      const statusMatch = statusFilter === 'all' || task.status === statusFilter;
      
      // Priority filter
      const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
      
      // Search query
      const searchMatch = 
        searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toString().includes(searchQuery);
      
      return statusMatch && priorityMatch && searchMatch;
    });
  }, [data, statusFilter, priorityFilter, searchQuery]);
  
  if (isLoading) return <LoadingSpinner size="lg" />;
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-red-800 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Error Loading Tasks</h2>
        <p>{error.message || 'Failed to load task data. Please try again.'}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600 mt-1">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
          </p>
        </div>
        <Link
          to="/create-task"
          className="btn btn-primary mt-4 md:mt-0"
        >
          <FaPlus className="mr-1" /> Create New Task
        </Link>
      </div>
      
      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full outline-none bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="todo">Todo</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
                <option value="deferred">Deferred</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tasks */}
      {filteredTasks.length === 0 ? (
        <div className="card text-center py-12">
          <FaFilter className="mx-auto text-4xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-1">No Tasks Found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Start by creating a new task'}
          </p>
          {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
            <Link to="/create-task" className="btn btn-primary inline-flex">
              <FaPlus className="mr-2" /> Create Task
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
} 