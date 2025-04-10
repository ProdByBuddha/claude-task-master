import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { FaTasks, FaCheckCircle, FaClock, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskCard from '../components/TaskCard';

export default function Dashboard() {
  // Fetch all tasks
  const { data: allTasks, isLoading, error } = useQuery('tasks', async () => {
    const response = await axios.get('/api/tasks');
    return response.data;
  });
  
  // Fetch next task
  const { data: nextTask } = useQuery('nextTask', async () => {
    const response = await axios.get('/api/next-task');
    return response.data;
  });
  
  // Calculate task stats
  const taskStats = React.useMemo(() => {
    if (!allTasks?.tasks) return {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      completion: 0
    };
    
    const tasks = allTasks.tasks;
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'done').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const pending = tasks.filter(task => ['todo', 'pending'].includes(task.status)).length;
    const completion = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, inProgress, pending, completion };
  }, [allTasks]);
  
  if (isLoading) return <LoadingSpinner size="lg" />;
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-red-800 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
        <p>{error.message || 'Failed to load task data. Please try again.'}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Master Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Your AI-powered task management system
          </p>
        </div>
        <Link
          to="/create-task"
          className="btn btn-primary mt-4 md:mt-0"
        >
          Create New Task
        </Link>
      </div>
      
      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <FaTasks className="text-2xl text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
            <p className="text-2xl font-bold">{taskStats.total}</p>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <FaCheckCircle className="text-2xl text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold">{taskStats.completed}</p>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <FaArrowRight className="text-2xl text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
            <p className="text-2xl font-bold">{taskStats.inProgress}</p>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <FaClock className="text-2xl text-yellow-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold">{taskStats.pending}</p>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-3">Project Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className="bg-blue-600 h-4 rounded-full" 
            style={{ width: `${taskStats.completion}%` }}
          ></div>
        </div>
        <p className="text-gray-600 text-sm">{taskStats.completion}% of tasks completed</p>
      </div>
      
      {/* Next Task Section */}
      {nextTask && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Next Task to Work On</h2>
            <Link to="/next-task" className="text-blue-600 text-sm font-medium hover:text-blue-800">
              View Details
            </Link>
          </div>
          <TaskCard task={nextTask} />
        </div>
      )}
      
      {/* Recent Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Tasks</h2>
          <Link to="/tasks" className="text-blue-600 text-sm font-medium hover:text-blue-800">
            View All Tasks
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTasks?.tasks?.slice(0, 6).map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
} 