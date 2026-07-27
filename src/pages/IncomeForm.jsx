"use client";
import { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Receipt, Plus, Edit2, Trash2 } from 'lucide-react';
import './FormStyles.css';

const IncomeForm = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useContext(AppContext);
  const [category, setCategory] = useState('Pre-registration');
  const [amount, setAmount] = useState('');
  const [count, setCount] = useState('1');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);

  const incomeTransactions = transactions.filter(t => t.type === 'income');

  const filteredData = useMemo(() => {
    const targetDate = new Date(selectedDate);
    
    return incomeTransactions.filter(t => {
      const tDate = new Date(t.date);
      if (viewMode === 'daily') {
        return tDate.toDateString() === targetDate.toDateString();
      }
      if (viewMode === 'monthly') {
        return tDate.getMonth() === targetDate.getMonth() && tDate.getFullYear() === targetDate.getFullYear();
      }
      if (viewMode === 'yearly') {
        return tDate.getFullYear() === targetDate.getFullYear();
      }
      return true; // 'all'
    });
  }, [incomeTransactions, viewMode, selectedDate]);

  const totalIncome = useMemo(() => {
    return filteredData.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    
    if (editingId) {
      const existingTx = transactions.find(t => t.id === editingId);
      updateTransaction({ 
        ...existingTx,
        category, 
        amount: Number(amount), 
        count: Number(count),
        description,
        date: new Date(transactionDate).toISOString()
      });
      setEditingId(null);
    } else {
      addTransaction({ 
        type: 'income',
        category, 
        amount: Number(amount), 
        count: Number(count),
        description,
        date: new Date(transactionDate).toISOString()
      });
    }
    setAmount('');
    setCount('1');
    setDescription('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setCategory(t.category);
    setAmount(t.amount.toString());
    setCount(t.count?.toString() || '1');
    setDescription(t.description || '');
    if (t.date) {
      setTransactionDate(new Date(t.date).toISOString().split('T')[0]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this income record?")) {
      deleteTransaction(id);
      if (editingId === id) {
        setEditingId(null);
        setAmount('');
        setCount('1');
        setDescription('');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Receipt className="text-success" size={32} />
        <h2>Income Log</h2>
      </div>

      <div className="form-grid">
        <div className="form-card glass-panel">
          <h3>{editingId ? 'Edit Income' : 'Log New Income'}</h3>
          <form onSubmit={handleSubmit} className="entry-form">
            <div className="input-group">
              <label>Income Category</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: category === 'Pre-registration' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: category === 'Pre-registration' ? 'rgba(58, 13, 22, 0.05)' : 'transparent', color: category === 'Pre-registration' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: category === 'Pre-registration' ? '600' : '400', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setCategory('Pre-registration')}
                >
                  Pre-registration
                </button>
                <button 
                  type="button"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: category === 'Post-payment' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: category === 'Post-payment' ? 'rgba(58, 13, 22, 0.05)' : 'transparent', color: category === 'Post-payment' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: category === 'Post-payment' ? '600' : '400', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setCategory('Post-payment')}
                >
                  Post-payment
                </button>
              </div>
            </div>
            <div className="input-group">
              <label>Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={transactionDate} 
                onChange={(e) => setTransactionDate(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Count</label>
              <input 
                type="number" 
                className="input-field" 
                value={count} 
                onChange={(e) => setCount(e.target.value)} 
                required 
                min="1"
              />
            </div>
            <div className="input-group">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                className="input-field" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                min="0"
              />
            </div>
            <button type="submit" className="btn-primary btn-success">
              {editingId ? <Edit2 size={18} /> : <Plus size={18} />} 
              {editingId ? 'Update Income' : 'Record Income'}
            </button>
          </form>
        </div>

        <div className="list-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0 }}>Recent Income</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {viewMode === 'daily' && (
                <input 
                  type="date" 
                  className="input-field" 
                  style={{ width: 'auto', padding: '6px 12px' }} 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                />
              )}
              {viewMode === 'monthly' && (
                <input 
                  type="month" 
                  className="input-field" 
                  style={{ width: 'auto', padding: '6px 12px' }} 
                  value={selectedDate.substring(0, 7)} 
                  onChange={(e) => setSelectedDate(`${e.target.value}-01`)} 
                />
              )}
              {viewMode === 'yearly' && (
                <input 
                  type="number" 
                  className="input-field" 
                  style={{ width: '100px', padding: '6px 12px' }} 
                  value={selectedDate.substring(0, 4)} 
                  onChange={(e) => setSelectedDate(`${e.target.value}-01-01`)} 
                  min="2000"
                  max="2100"
                />
              )}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: viewMode === 'daily' ? 'rgba(58, 13, 22, 0.1)' : 'transparent', color: viewMode === 'daily' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: viewMode === 'daily' ? '600' : '400', cursor: 'pointer' }}
                  onClick={() => setViewMode('daily')}
                >Daily</button>
                <button 
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: viewMode === 'monthly' ? 'rgba(58, 13, 22, 0.1)' : 'transparent', color: viewMode === 'monthly' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: viewMode === 'monthly' ? '600' : '400', cursor: 'pointer' }}
                  onClick={() => setViewMode('monthly')}
                >Monthly</button>
                <button 
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: viewMode === 'yearly' ? 'rgba(58, 13, 22, 0.1)' : 'transparent', color: viewMode === 'yearly' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: viewMode === 'yearly' ? '600' : '400', cursor: 'pointer' }}
                  onClick={() => setViewMode('yearly')}
                >Yearly</button>
                <button 
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: viewMode === 'all' ? 'rgba(58, 13, 22, 0.1)' : 'transparent', color: viewMode === 'all' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: viewMode === 'all' ? '600' : '400', cursor: 'pointer' }}
                  onClick={() => setViewMode('all')}
                >All</button>
              </div>
            </div>
          </div>
          {filteredData.length === 0 ? (
            <p className="text-secondary">No income logged for this period.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Count</th>
                  <th>Amount (₹)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice().reverse().map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td><strong>{t.category}</strong></td>
                    <td>{t.count || 1}</td>
                    <td className="text-success font-semibold">+₹{t.amount.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" onClick={() => handleEdit(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: '16px' }} title="Edit"><Edit2 size={18} /></button>
                      <button type="button" onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }} title="Delete"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: '700', padding: '16px' }}>Total Income:</td>
                  <td className="text-success" style={{ fontWeight: '700', fontSize: '1.1rem', padding: '16px' }}>+₹{totalIncome.toLocaleString('en-IN')}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomeForm;
