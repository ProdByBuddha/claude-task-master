import { Link, useLocation } from 'react-router-dom';
import { FaTasks, FaPlus, FaArrowRight, FaHome, FaCog } from 'react-icons/fa';

const navigationItems = [
  { to: '/', label: 'Dashboard', icon: <FaHome /> },
  { to: '/tasks', label: 'Tasks', icon: <FaTasks /> },
  { to: '/create-task', label: 'New Task', icon: <FaPlus /> },
  { to: '/next-task', label: 'Next Task', icon: <FaArrowRight /> },
];

export default function Layout({ children }) {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Claude Task Master</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                    location.pathname === item.to
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {/* Mobile header */}
      <div className="flex flex-col flex-1">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center md:hidden">
          <h1 className="text-xl font-bold text-blue-600">Claude Task Master</h1>
          <button className="text-gray-500 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
        
        {/* Mobile navigation */}
        <nav className="bg-white border-b border-gray-200 p-2 flex overflow-x-auto md:hidden">
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center p-2 min-w-[80px] text-center ${
                location.pathname === item.to
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-700'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 