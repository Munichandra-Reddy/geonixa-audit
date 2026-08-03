"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, PieChart, Receipt, Users, LogOut, GraduationCap, Bell } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className={`sidebar glass-panel ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-logo">
        <h3>Geonixa</h3>
        <span>Audit</span>
      </div>
      <nav className="sidebar-nav">
        <Link href="/" className={pathname === '/' ? "nav-item active" : "nav-item"} onClick={() => setIsOpen(false)}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/income" className={pathname === '/income' ? "nav-item active" : "nav-item"} onClick={() => setIsOpen(false)}>
          <Receipt size={20} />
          <span>Income Log</span>
        </Link>
        <Link href="/expenses" className={pathname === '/expenses' ? "nav-item active" : "nav-item"} onClick={() => setIsOpen(false)}>
          <PieChart size={20} />
          <span>Expenses</span>
        </Link>
        <Link href="/employees" className={pathname === '/employees' ? "nav-item active" : "nav-item"} onClick={() => setIsOpen(false)}>
          <Users size={20} />
          <span>Employees</span>
        </Link>
        <Link href="/mentors" className={pathname === '/mentors' ? "nav-item active" : "nav-item"} onClick={() => setIsOpen(false)}>
          <GraduationCap size={20} />
          <span>Mentors</span>
        </Link>
        <Link href="/notifications" className={pathname === '/notifications' ? "nav-item active" : "nav-item"} onClick={() => setIsOpen(false)}>
          <Bell size={20} />
          <span>Notifications</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
