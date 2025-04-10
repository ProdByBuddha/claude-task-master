/**
 * web-adapter.js
 * Adapter for task-manager.js functions to be used by the web API
 */

import path from 'path';
import {
  listTasks as cliListTasks,
  setTaskStatus as cliSetTaskStatus,
  expandTask as cliExpandTask,
  addTask as cliAddTask,
  findNextTask
} from './task-manager.js';

import { readJSON } from './utils.js';

/**
 * Get all tasks with optional filtering
 * @param {Object} options - Options object
 * @param {boolean} options.showDependencies - Whether to include dependencies info
 * @param {string} options.projectRoot - Project root directory
 * @returns {Object} Tasks data
 */
export async function listTasks(options = {}) {
  const tasksPath = path.join(options.projectRoot || process.cwd(), 'tasks', 'tasks.json');
  
  // Just return the raw tasks data without CLI output formatting
  const data = readJSON(tasksPath);
  if (!data || !data.tasks) {
    throw new Error(`No valid tasks found in ${tasksPath}`);
  }
  
  return data;
}

/**
 * Get a single task by ID
 * @param {Object} options - Options object
 * @param {string} options.id - Task ID (can include subtask notation like "1.2")
 * @param {string} options.projectRoot - Project root directory
 * @returns {Object} Task data
 */
export async function getTask(options = {}) {
  const tasksPath = path.join(options.projectRoot || process.cwd(), 'tasks', 'tasks.json');
  const taskId = options.id;
  
  if (!taskId) {
    throw new Error('Task ID is required');
  }
  
  // Read tasks file
  const data = readJSON(tasksPath);
  if (!data || !data.tasks) {
    throw new Error(`No valid tasks found in ${tasksPath}`);
  }
  
  // Check if it's a subtask (e.g., "1.2")
  if (taskId.includes('.')) {
    const [parentId, subtaskId] = taskId.split('.').map(id => parseInt(id, 10));
    const parentTask = data.tasks.find(t => t.id === parentId);
    
    if (!parentTask) {
      return null;
    }
    
    if (!parentTask.subtasks) {
      return null;
    }
    
    const subtask = parentTask.subtasks.find(st => st.id === subtaskId);
    if (!subtask) {
      return null;
    }
    
    // Return a combination of parent and subtask data
    return {
      ...subtask,
      parentTaskId: parentTask.id,
      parentTaskTitle: parentTask.title
    };
  } else {
    // Regular task
    const task = data.tasks.find(t => t.id === parseInt(taskId, 10));
    return task || null;
  }
}

/**
 * Update task status
 * @param {Object} options - Options object
 * @param {string} options.id - Task ID
 * @param {string} options.status - New status
 * @param {string} options.projectRoot - Project root directory
 */
export async function setTaskStatus(options = {}) {
  const tasksPath = path.join(options.projectRoot || process.cwd(), 'tasks', 'tasks.json');
  const taskId = options.id;
  const status = options.status;
  
  if (!taskId || !status) {
    throw new Error('Both task ID and status are required');
  }
  
  // Call the CLI version with adapted parameters
  await cliSetTaskStatus(tasksPath, taskId, status);
  
  return { success: true };
}

/**
 * Expand a task into subtasks
 * @param {Object} options - Options object
 * @param {string} options.id - Task ID
 * @param {string} options.prompt - Additional context
 * @param {number} options.num - Number of subtasks to generate
 * @param {string} options.projectRoot - Project root directory
 */
export async function expandTask(options = {}) {
  const taskId = parseInt(options.id, 10);
  const numSubtasks = options.num || 3;
  const additionalContext = options.prompt || '';
  
  if (!taskId) {
    throw new Error('Task ID is required');
  }
  
  // Call the CLI version with adapted parameters
  await cliExpandTask(taskId, numSubtasks, false, additionalContext);
  
  // Return the updated task
  const tasksPath = path.join(options.projectRoot || process.cwd(), 'tasks', 'tasks.json');
  const data = readJSON(tasksPath);
  if (!data || !data.tasks) {
    throw new Error(`No valid tasks found in ${tasksPath}`);
  }
  
  return data.tasks.find(t => t.id === taskId) || null;
}

/**
 * Get the next task to work on
 * @param {Object} options - Options object
 * @param {string} options.projectRoot - Project root directory
 */
export async function getNextTask(options = {}) {
  const tasksPath = path.join(options.projectRoot || process.cwd(), 'tasks', 'tasks.json');
  
  // Read tasks file
  const data = readJSON(tasksPath);
  if (!data || !data.tasks) {
    throw new Error(`No valid tasks found in ${tasksPath}`);
  }
  
  // Use the findNextTask function from task-manager.js
  const nextTask = findNextTask(data.tasks);
  return nextTask || null;
}

/**
 * Add a new task
 * @param {Object} options - Options object
 * @param {string} options.prompt - Task description
 * @param {string} options.priority - Task priority
 * @param {string} options.dependencies - Comma-separated list of dependencies
 * @param {string} options.projectRoot - Project root directory
 */
export async function addTask(options = {}) {
  const tasksPath = path.join(options.projectRoot || process.cwd(), 'tasks', 'tasks.json');
  const prompt = options.prompt;
  const priority = options.priority || 'medium';
  const dependencies = options.dependencies ? 
    options.dependencies.split(',').map(id => parseInt(id.trim(), 10)) : 
    [];
  
  if (!prompt) {
    throw new Error('Task prompt is required');
  }
  
  // Call the CLI version with adapted parameters
  const newTaskId = await cliAddTask(tasksPath, prompt, dependencies, priority);
  
  // Return the newly created task
  const data = readJSON(tasksPath);
  if (!data || !data.tasks) {
    throw new Error(`No valid tasks found in ${tasksPath}`);
  }
  
  return data.tasks.find(t => t.id === newTaskId) || null;
} 