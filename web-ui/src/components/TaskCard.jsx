import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaClock, FaBan, FaExclamationTriangle } from 'react-icons/fa';

const statusIcons = {
  'todo': <FaClock className="text-yellow-500" />,
  'pending': <FaClock className="text-yellow-500" />,
  'in-progress': <FaArrowRight className="text-blue-500" />,
  'review': <FaExclamationTriangle className="text-orange-500" />,
  'done': <FaCheckCircle className="text-green-500" />,
  'deferred': <FaBan className="text-gray-500" />
};

const statusClasses = {
  'todo': 'bg-yellow-100 text-yellow-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'review': 'bg-orange-100 text-orange-800',
  'done': 'bg-green-100 text-green-800',
  'deferred': 'bg-gray-100 text-gray-800'
};

const priorityClasses = {
  'high': 'bg-red-100 text-red-800',
  'medium': 'bg-blue-100 text-blue-800',
  'low': 'bg-gray-100 text-gray-800'
};

export default function TaskCard({ task }) {
  const {
    id,
    title,
    description,
    status,
    priority,
    dependencies = []
  } = task;
  
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 mr-2">
          <span>Task {id}: </span>
          {title}
        </h3>
        <div className="flex gap-2">
          <span className={`badge ${statusClasses[status] || 'bg-gray-100'} flex items-center gap-1`}>
            {statusIcons[status] || <FaClock />} {status}
          </span>
          <span className={`badge ${priorityClasses[priority] || 'bg-gray-100'}`}>
            {priority}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
      
      {dependencies.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Dependencies:</h4>
          <div className="flex flex-wrap gap-1">
            {dependencies.map(dep => (
              <span 
                key={dep} 
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                Task {dep}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-auto pt-2">
        <Link 
          to={`/tasks/${id}`}
          className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1"
        >
          View Details <FaArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
} 