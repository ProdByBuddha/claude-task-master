import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project root directory (one level up)
const projectRoot = resolve(__dirname, '..');

console.log('Current directory:', process.cwd());
console.log('Script directory:', __dirname);
console.log('Project root:', projectRoot);

// Check if tasks.json exists
const tasksPath = join(projectRoot, 'tasks', 'tasks.json');
console.log('Looking for tasks.json at:', tasksPath);

try {
  if (fs.existsSync(tasksPath)) {
    console.log('✅ tasks.json file found!');
    
    // Try to read and parse the file
    try {
      const rawData = fs.readFileSync(tasksPath, 'utf8');
      const tasksData = JSON.parse(rawData);
      
      console.log('✅ Successfully parsed tasks.json');
      console.log('Found', tasksData.tasks?.length || 0, 'tasks');
      
      if (tasksData.tasks?.length > 0) {
        console.log('First task:', tasksData.tasks[0].title);
      }
    } catch (error) {
      console.error('❌ Error parsing tasks.json:', error.message);
    }
  } else {
    console.error('❌ tasks.json file not found at', tasksPath);
    
    // List contents of tasks directory to help debug
    try {
      const tasksDir = join(projectRoot, 'tasks');
      if (fs.existsSync(tasksDir)) {
        console.log('Contents of tasks directory:');
        const files = fs.readdirSync(tasksDir);
        files.forEach(file => {
          console.log('- ' + file);
        });
      } else {
        console.error('❌ tasks directory not found at', tasksDir);
      }
    } catch (dirError) {
      console.error('❌ Error reading tasks directory:', dirError.message);
    }
  }
} catch (error) {
  console.error('❌ Error checking for tasks.json:', error.message);
}

// Try listing directories in project root to help with debugging
try {
  console.log('\nDirectories in project root:');
  const rootDirs = fs.readdirSync(projectRoot, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  rootDirs.forEach(dir => {
    console.log('- ' + dir);
  });
} catch (error) {
  console.error('❌ Error listing directories in project root:', error.message);
} 