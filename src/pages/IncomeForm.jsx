"use client";
import { useState, useContext, useMemo, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Receipt, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import './FormStyles.css';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const IncomeForm = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useContext(AppContext);
  const [category, setCategory] = useState('Pre-registration');
  const [amount, setAmount] = useState('1000');
  const [count, setCount] = useState('1');
  const [monthCounts, setMonthCounts] = useState({});
  const [postPrices, setPostPrices] = useState(['']);
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);

  const carouselRef = useRef(null);

  // Auto-calculate Amount for Pre-registration (₹1,000 per count)
  useEffect(() => {
    if (category === 'Pre-registration') {
      const numCount = Number(count);
      if (!isNaN(numCount) && numCount > 0) {
        setAmount((numCount * 1000).toString());
      } else if (count === '' || numCount === 0) {
        setAmount('');
      }
    }
  }, [category, count]);

  // Sync postPrices array length with count for Post-payment
  useEffect(() => {
    if (category === 'Post-payment') {
      const numCount = Math.max(0, parseInt(count, 10) || 0);
      if (numCount > 0) {
        setPostPrices(prev => {
          const next = [...prev];
          if (next.length < numCount) {
            while (next.length < numCount) {
              next.push('');
            }
          } else if (next.length > numCount) {
            return next.slice(0, numCount);
          }
          return next;
        });
      } else {
        setPostPrices([]);
        setAmount('');
      }
    }
  }, [category, count]);

  // Generate 25 months (12 past, current, 12 future)
  const generatedMonths = useMemo(() => {
    const list = [];
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 12, 1);
    for (let i = 0; i < 25; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      list.push({
        key: monthKey,
        monthName: monthNames[d.getMonth()],
        year: d.getFullYear(),
        isCurrent: d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      });
    }
    return list;
  }, []);

  // Auto-scroll so current month (e.g. August) is the first visible month by default
  useEffect(() => {
    if (carouselRef.current) {
      const currentMonthIndex = generatedMonths.findIndex(m => m.isCurrent);
      if (currentMonthIndex !== -1) {
        const cardWidth = (carouselRef.current.clientWidth - 30) / 4;
        carouselRef.current.scrollLeft = currentMonthIndex * (cardWidth + 10);
      }
    }
  }, [generatedMonths]);

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      const cardWidth = (carouselRef.current.clientWidth - 30) / 4;
      carouselRef.current.scrollBy({ left: -(cardWidth + 10) * 2, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      const cardWidth = (carouselRef.current.clientWidth - 30) / 4;
      carouselRef.current.scrollBy({ left: (cardWidth + 10) * 2, behavior: 'smooth' });
    }
  };

  // Monthly count handler for month carousel cards
  const handleMonthCountChange = (key, val) => {
    const cleanVal = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    const newMonthCounts = {
      ...monthCounts,
      [key]: cleanVal
    };

    if (cleanVal === '' || cleanVal === 0) {
      delete newMonthCounts[key];
    }

    setMonthCounts(newMonthCounts);

    const total = Object.values(newMonthCounts).reduce((sum, v) => sum + (Number(v) || 0), 0);
    setCount(total > 0 ? total.toString() : '');
  };

  const totalCalculatedMonthCount = useMemo(() => {
    return Object.values(monthCounts).reduce((sum, val) => sum + (Number(val) || 0), 0);
  }, [monthCounts]);

  const monthBreakdownText = useMemo(() => {
    const activeEntries = Object.entries(monthCounts).filter(([_, v]) => Number(v) > 0);
    if (activeEntries.length === 0) return '';
    return activeEntries.map(([key, v]) => {
      const mObj = generatedMonths.find(m => m.key === key);
      const name = mObj ? mObj.monthName : key;
      return `${name}: ${v}`;
    }).join(', ');
  }, [monthCounts, generatedMonths]);

  // Individual price box change handler for Post-payment
  const handleIndividualPriceChange = (index, val) => {
    const cleanVal = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    const updated = [...postPrices];
    updated[index] = cleanVal;
    setPostPrices(updated);

    const total = updated.reduce((sum, p) => sum + (Number(p) || 0), 0);
    setAmount(total > 0 ? total.toString() : '');
  };

  const totalPostPricesSum = useMemo(() => {
    return postPrices.reduce((sum, p) => sum + (Number(p) || 0), 0);
  }, [postPrices]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat === 'Pre-registration') {
      const numCount = Number(count) || (totalCalculatedMonthCount > 0 ? totalCalculatedMonthCount : 1);
      setAmount((numCount * 1000).toString());
    } else {
      // Post-payment
      const total = postPrices.reduce((sum, p) => sum + (Number(p) || 0), 0);
      setAmount(total > 0 ? total.toString() : '');
    }
  };

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
    
    const finalCount = Number(count) || (totalCalculatedMonthCount > 0 ? totalCalculatedMonthCount : 1);

    if (editingId) {
      const existingTx = transactions.find(t => t.id === editingId);
      updateTransaction({ 
        ...existingTx,
        category, 
        amount: Number(amount), 
        count: finalCount,
        monthFilter: monthBreakdownText,
        description,
        date: new Date(transactionDate).toISOString()
      });
      setEditingId(null);
    } else {
      addTransaction({ 
        type: 'income',
        category, 
        amount: Number(amount), 
        count: finalCount,
        monthFilter: monthBreakdownText,
        description,
        date: new Date(transactionDate).toISOString()
      });
    }
    setCount('1');
    setAmount(category === 'Pre-registration' ? '1000' : '');
    setMonthCounts({});
    setPostPrices(['']);
    setDescription('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setCategory(t.category);
    setAmount(t.amount.toString());
    const tCount = t.count?.toString() || '1';
    setCount(tCount);
    setMonthCounts({});
    if (t.category === 'Post-payment') {
      const numC = parseInt(tCount, 10) || 1;
      const initialPrices = Array(numC).fill('');
      if (numC === 1) initialPrices[0] = t.amount;
      setPostPrices(initialPrices);
    } else {
      setPostPrices(['']);
    }
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
        setCount('1');
        setAmount(category === 'Pre-registration' ? '1000' : '');
        setMonthCounts({});
        setPostPrices(['']);
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
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: category === 'Pre-registration' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: category === 'Pre-registration' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: category === 'Pre-registration' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: category === 'Pre-registration' ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleCategoryChange('Pre-registration')}
                >
                  Pre-registration
                </button>
                <button 
                  type="button"
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: category === 'Post-payment' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: category === 'Post-payment' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: category === 'Post-payment' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: category === 'Post-payment' ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleCategoryChange('Post-payment')}
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

            {/* Count input */}
            <div className="input-group">
              <label>Count</label>
              <input 
                type="number" 
                className="input-field" 
                value={count} 
                onChange={(e) => setCount(e.target.value)} 
                required 
                min="1"
                placeholder={category === 'Post-payment' ? 'Enter count (e.g. 10)' : 'Enter count or fill months below'}
              />

              {/* 4-Month Scrollable Carousel (Clean Count input for all months) */}
              <div className="month-count-section">
                <div className="month-count-header">
                  <span className="month-count-header-title">
                    Months (4 visible, scroll for before/after)
                  </span>
                  <div className="month-carousel-nav">
                    <button 
                      type="button" 
                      className="month-scroll-btn" 
                      onClick={handleScrollLeft} 
                      title="Scroll previous months"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      type="button" 
                      className="month-scroll-btn" 
                      onClick={handleScrollRight} 
                      title="Scroll next months"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="month-carousel-container">
                  <div className="month-carousel-track" ref={carouselRef}>
                    {generatedMonths.map(m => {
                      const mVal = monthCounts[m.key] !== undefined ? monthCounts[m.key] : '';
                      const hasCount = Number(mVal) > 0;
                      return (
                        <div 
                          key={m.key} 
                          className={`month-card ${hasCount ? 'has-count' : ''} ${m.isCurrent ? 'is-current' : ''}`}
                        >
                          <div className="month-card-header">
                            <span className="month-card-name">{m.monthName}</span>
                            <span className="month-card-year">{m.year}</span>
                          </div>
                          <input 
                            type="number" 
                            className="month-count-input" 
                            placeholder="0"
                            min="0"
                            value={mVal}
                            onChange={(e) => handleMonthCountChange(m.key, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Post-payment Dynamic Price Pop-Out Boxes */}
              {category === 'Post-payment' && Number(count) > 0 && (
                <div className="post-prices-container">
                  <div className="post-prices-header">
                    <span className="post-prices-title">
                      Enter Price for each of the {count} Count{Number(count) > 1 ? 's' : ''}:
                    </span>
                    <span className="post-prices-total-badge">
                      Total Added: ₹{totalPostPricesSum.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="post-prices-grid">
                    {postPrices.map((prc, idx) => (
                      <div key={idx} className="post-price-item">
                        <span className="post-price-label">Price #{idx + 1}</span>
                        <div className="post-price-input-wrap">
                          <span className="post-price-currency">₹</span>
                          <input 
                            type="number" 
                            className="post-price-input" 
                            placeholder="0"
                            min="0"
                            value={prc}
                            onChange={(e) => handleIndividualPriceChange(idx, e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: viewMode === 'daily' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', color: viewMode === 'daily' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: viewMode === 'daily' ? '600' : '500', cursor: 'pointer' }}
                  onClick={() => setViewMode('daily')}
                >Daily</button>
                <button 
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: viewMode === 'monthly' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', color: viewMode === 'monthly' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: viewMode === 'monthly' ? '600' : '500', cursor: 'pointer' }}
                  onClick={() => setViewMode('monthly')}
                >Monthly</button>
                <button 
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: viewMode === 'yearly' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', color: viewMode === 'yearly' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: viewMode === 'yearly' ? '600' : '500', cursor: 'pointer' }}
                  onClick={() => setViewMode('yearly')}
                >Yearly</button>
                <button 
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: viewMode === 'all' ? 'rgba(99, 102, 241, 0.12)' : 'transparent', color: viewMode === 'all' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: viewMode === 'all' ? '600' : '500', cursor: 'pointer' }}
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
