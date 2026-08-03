"use client";
import { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Clock } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { transactions, mentors } = useContext(AppContext);
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const filteredData = useMemo(() => {
    const targetDate = new Date(selectedDate);
    
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (viewMode === 'daily') {
        return tDate.toDateString() === targetDate.toDateString();
      }
      // default: monthly
      return tDate.getMonth() === targetDate.getMonth() && tDate.getFullYear() === targetDate.getFullYear();
    });
  }, [transactions, viewMode, selectedDate]);

  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let preRegistrationCount = 0;
    let preRegistrationAmount = 0;
    let postPaymentCount = 0;
    let postPaymentAmount = 0;

    filteredData.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
        if (t.category === 'Pre-registration') {
          preRegistrationCount += (Number(t.count) || 1); 
          preRegistrationAmount += t.amount;
        } else if (t.category === 'Post-payment') {
          postPaymentCount += (Number(t.count) || 1);
          postPaymentAmount += t.amount;
        }
      } else {
        totalExpenses += t.amount;
      }
    });

    const targetDateStr = selectedDate.substring(0, 7);
    
    let totalMentorSalaries = 0;
    (mentors || []).forEach(mentor => {
      if (!mentor.paymentDate) return;
      if (viewMode === 'daily' && `${mentor.paymentDate}-01` === selectedDate) {
        totalMentorSalaries += (mentor.total || 0);
      } else if (viewMode === 'monthly' && mentor.paymentDate === targetDateStr) {
        totalMentorSalaries += (mentor.total || 0);
      }
    });

    totalExpenses += totalMentorSalaries;

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      preRegistrationCount,
      preRegistrationAmount,
      postPaymentCount,
      postPaymentAmount,
      pendingCount: postPaymentCount - preRegistrationCount,
      pendingAmount: postPaymentAmount - preRegistrationAmount
    };
  }, [filteredData, mentors, viewMode, selectedDate]);

  const combinedRecentTransactions = useMemo(() => {
    const regularTx = filteredData.map(t => ({
      id: t.id,
      date: t.date,
      category: t.category,
      description: t.description,
      amount: t.amount,
      type: t.type
    }));

    const targetDateStr = selectedDate.substring(0, 7);
    
    const mentorTx = (mentors || [])
      .filter(mentor => {
        if (!mentor.paymentDate) return false;
        if (viewMode === 'daily') {
          return `${mentor.paymentDate}-01` === selectedDate;
        }
        if (viewMode === 'monthly') {
          return mentor.paymentDate === targetDateStr;
        }
        return false;
      })
      .map(mentor => ({
        id: `mentor-${mentor.id}`,
        date: `${mentor.paymentDate}-01T00:00:00.000Z`, 
        category: 'Mentor Salary',
        description: `Salary for ${mentor.name} (${mentor.course})`,
        amount: mentor.total || 0,
        type: 'expense'
      }));

    return [...regularTx, ...mentorTx].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData, mentors, viewMode, selectedDate]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="view-toggles glass-panel" style={{ display: 'flex', alignItems: 'center' }}>
          {viewMode === 'daily' && (
            <input 
              type="date" 
              className="input-field" 
              style={{ width: 'auto', padding: '6px 12px', marginRight: '8px', border: 'none', background: 'transparent' }} 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
            />
          )}
          {viewMode === 'monthly' && (
            <input 
              type="month" 
              className="input-field" 
              style={{ width: 'auto', padding: '6px 12px', marginRight: '8px', border: 'none', background: 'transparent' }} 
              value={selectedDate.substring(0, 7)} 
              onChange={(e) => setSelectedDate(`${e.target.value}-01`)} 
            />
          )}
          <button 
            className={`toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
            onClick={() => setViewMode('daily')}
          >Daily</button>
          <button 
            className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''}`}
            onClick={() => setViewMode('monthly')}
          >Monthly</button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{background: 'rgba(58, 13, 22, 0.1)', color: 'var(--primary-color)'}}>
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">Pre-registration ({viewMode})</span>
              <span className="stat-count-badge">Count: {summary.preRegistrationCount}</span>
            </div>
            <h3 className="stat-value text-success">{formatCurrency(summary.preRegistrationAmount)}</h3>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{background: 'rgba(58, 13, 22, 0.1)', color: 'var(--primary-color)'}}>
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">Post-payment ({viewMode})</span>
              <span className="stat-count-badge">Count: {summary.postPaymentCount}</span>
            </div>
            <h3 className="stat-value text-success">{formatCurrency(summary.postPaymentAmount)}</h3>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{background: 'rgba(58, 13, 22, 0.1)', color: 'var(--primary-color)'}}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">Pending ({viewMode})</span>
              <span className="stat-count-badge">Count: {summary.pendingCount}</span>
            </div>
            <h3 className="stat-value text-warning">{formatCurrency(summary.pendingAmount)}</h3>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)'}}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Income ({viewMode})</span>
            <h3 className="stat-value text-success">{formatCurrency(summary.totalIncome)}</h3>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)'}}>
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Expenditure ({viewMode})</span>
            <h3 className="stat-value text-danger">{formatCurrency(summary.totalExpenses)}</h3>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Net P/L ({viewMode})</span>
            <h3 className="stat-value">{formatCurrency(summary.netProfit)}</h3>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="recent-activity glass-panel">
          <h3>Recent Transactions ({viewMode})</h3>
          {combinedRecentTransactions.length === 0 ? (
            <p className="text-secondary" style={{padding: '20px', textAlign: 'center'}}>No data for this period.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Date</th>
                  <th style={{ width: '25%' }}>Category</th>
                  <th style={{ width: '40%' }}>Description</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {combinedRecentTransactions.slice().reverse().slice(0, 10).map((t) => (
                  <tr key={t.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.date).toLocaleDateString()}</td>
                    <td><strong>{t.category}</strong></td>
                    <td>{t.description || '-'}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} className={`font-semibold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
