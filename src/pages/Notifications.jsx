"use client";
import { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Bell, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Users, GraduationCap, Clock } from 'lucide-react';
import './FormStyles.css';

const Notifications = () => {
  const { transactions, employees, mentors } = useContext(AppContext);
  const [filter, setFilter] = useState('all');

  const notificationsList = useMemo(() => {
    const list = [];

    // 1. Transaction notifications
    const recentTx = transactions.slice().reverse().slice(0, 10);
    recentTx.forEach((tx) => {
      if (tx.type === 'income') {
        list.push({
          id: `tx-inc-${tx.id}`,
          type: 'income',
          title: `Income Recorded: ${tx.category}`,
          message: `Received ₹${tx.amount.toLocaleString('en-IN')}${tx.description ? ` - ${tx.description}` : ''}`,
          date: tx.date,
          icon: <TrendingUp className="text-success" size={20} />,
          badge: 'Income'
        });
      } else {
        list.push({
          id: `tx-exp-${tx.id}`,
          type: 'expense',
          title: `Expense Logged: ${tx.category}`,
          message: `Paid ₹${tx.amount.toLocaleString('en-IN')}${tx.description ? ` - ${tx.description}` : ''}`,
          date: tx.date,
          icon: <TrendingDown className="text-danger" size={20} />,
          badge: 'Expense'
        });
      }
    });

    // 2. Pending post payments alert
    const preCount = transactions.filter(t => t.type === 'income' && t.category === 'Pre-registration').reduce((s, t) => s + (t.count || 1), 0);
    const postCount = transactions.filter(t => t.type === 'income' && t.category === 'Post-payment').reduce((s, t) => s + (t.count || 1), 0);
    const pendingCount = postCount - preCount;
    if (pendingCount > 0) {
      list.push({
        id: 'pending-post-alert',
        type: 'alert',
        title: 'Pending Registrations Alert',
        message: `There are ${pendingCount} pending post-payment registrations requiring audit verification.`,
        date: new Date().toISOString(),
        icon: <AlertCircle style={{ color: '#d97706' }} size={20} />,
        badge: 'Alert'
      });
    }

    // 3. Employee & Mentor team summary
    if (employees.length > 0) {
      list.push({
        id: 'emp-status',
        type: 'info',
        title: 'Employee Roster Active',
        message: `${employees.length} employees currently registered in the audit system.`,
        date: new Date().toISOString(),
        icon: <Users className="text-primary" size={20} />,
        badge: 'Staff'
      });
    }

    if (mentors.length > 0) {
      list.push({
        id: 'mentor-status',
        type: 'info',
        title: 'Mentor Management Active',
        message: `${mentors.length} mentors currently enrolled across courses.`,
        date: new Date().toISOString(),
        icon: <GraduationCap className="text-primary" size={20} />,
        badge: 'Mentors'
      });
    }

    // Sort by date descending
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, employees, mentors]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'income') return notificationsList.filter(n => n.type === 'income');
    if (filter === 'expense') return notificationsList.filter(n => n.type === 'expense');
    if (filter === 'alert') return notificationsList.filter(n => n.type === 'alert' || n.type === 'info');
    return notificationsList;
  }, [notificationsList, filter]);

  return (
    <div className="page-container">
      <div className="page-header">
        <Bell className="text-primary" size={32} />
        <h2>Notifications</h2>
      </div>

      <div className="list-card glass-panel" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0 }}>System & Audit Activity</h3>
            <span style={{ background: 'var(--primary-color)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
              {filteredNotifications.length}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: filter === 'all' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', color: filter === 'all' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: filter === 'all' ? '700' : '500', cursor: 'pointer' }}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: filter === 'income' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', color: filter === 'income' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: filter === 'income' ? '700' : '500', cursor: 'pointer' }}
              onClick={() => setFilter('income')}
            >
              Income
            </button>
            <button 
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: filter === 'expense' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', color: filter === 'expense' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: filter === 'expense' ? '700' : '500', cursor: 'pointer' }}
              onClick={() => setFilter('expense')}
            >
              Expenses
            </button>
            <button 
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: filter === 'alert' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', color: filter === 'alert' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: filter === 'alert' ? '700' : '500', cursor: 'pointer' }}
              onClick={() => setFilter('alert')}
            >
              Alerts
            </button>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            <CheckCircle2 size={40} style={{ marginBottom: '12px', opacity: 0.6 }} />
            <p>No notifications to display right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredNotifications.map((n) => (
              <div 
                key={n.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '16px', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.4)',
                  transition: 'background 0.2s ease'
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {n.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{n.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {new Date(n.date).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
