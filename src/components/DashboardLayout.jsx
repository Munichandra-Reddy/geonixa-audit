"use client";
import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="topbar glass-panel">
          <h2>Overview</h2>
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
