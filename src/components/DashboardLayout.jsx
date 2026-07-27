"use client";
import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="main-content">
        <header className="topbar glass-panel">
          <div className="topbar-left">
            <button 
              className="menu-btn mobile-only"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2>Overview</h2>
          </div>
          <div className="user-profile">
            <span>Admin</span>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
