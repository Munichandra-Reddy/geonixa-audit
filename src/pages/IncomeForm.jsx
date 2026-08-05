"use client";
import { useState, useContext, useMemo, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Receipt, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import './FormStyles.css';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const IncomeForm = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, employees } = useContext(AppContext);
  const [category, setCategory] = useState('Pre-registration');
  const [amount, setAmount] = useState('1000');
  const [count, setCount] = useState('1');
  const [monthCounts, setMonthCounts] = useState({});
  const [postMonthPrices, setPostMonthPrices] = useState({});
  const [postMonthEmployees, setPostMonthEmployees] = useState({});
  const [postMonthStudents, setPostMonthStudents] = useState({});
  const [activePostMonth, setActivePostMonth] = useState('');
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

  // Set default active month and initialize count 1 on load
  useEffect(() => {
    const currentMonth = generatedMonths.find(m => m.isCurrent);
    if (currentMonth && !activePostMonth) {
      setActivePostMonth(currentMonth.key);
      setMonthCounts(prev => {
        if (Object.keys(prev).length === 0) {
          return { [currentMonth.key]: 1 };
        }
        return prev;
      });
      setPostMonthPrices(prev => {
        if (Object.keys(prev).length === 0) {
          return { [currentMonth.key]: [category === 'Pre-registration' ? '1000' : ''] };
        }
        return prev;
      });
      setPostMonthEmployees(prev => {
        if (Object.keys(prev).length === 0) {
          return { [currentMonth.key]: [''] };
        }
        return prev;
      });
      setPostMonthStudents(prev => {
        if (Object.keys(prev).length === 0) {
          return { [currentMonth.key]: [''] };
        }
        return prev;
      });
    }
  }, [generatedMonths, activePostMonth, category]);

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

  // Month count handler for month cards in both categories
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
    setActivePostMonth(key);

    const total = Object.values(newMonthCounts).reduce((sum, v) => sum + (Number(v) || 0), 0);
    setCount(total > 0 ? total.toString() : '');

    const num = Number(cleanVal) || 0;

    // Resize price array for this month
    setPostMonthPrices(prev => {
      const currentPrices = prev[key] ? [...prev[key]] : [];
      if (num > 0) {
        while (currentPrices.length < num) {
          currentPrices.push(category === 'Pre-registration' ? '1000' : '');
        }
        if (currentPrices.length > num) {
          currentPrices.length = num;
        }
      } else {
        currentPrices.length = 0;
      }

      const updated = { ...prev, [key]: currentPrices };
      if (num === 0) delete updated[key];

      if (category === 'Post-payment') {
        const totalAllMonths = Object.values(updated).reduce((sum, pricesArr) => {
          return sum + (pricesArr || []).reduce((mSum, p) => mSum + (Number(p) || 0), 0);
        }, 0);
        setAmount(totalAllMonths > 0 ? totalAllMonths.toString() : '');
      } else if (category === 'Pre-registration') {
        setAmount(total > 0 ? (total * 1000).toString() : '');
      }

      return updated;
    });

    // Resize employees array for this month
    setPostMonthEmployees(prev => {
      const current = prev[key] ? [...prev[key]] : [];
      if (num > 0) {
        while (current.length < num) current.push('');
        if (current.length > num) current.length = num;
      } else {
        current.length = 0;
      }
      const updated = { ...prev, [key]: current };
      if (num === 0) delete updated[key];
      return updated;
    });

    // Resize students array for this month
    setPostMonthStudents(prev => {
      const current = prev[key] ? [...prev[key]] : [];
      if (num > 0) {
        while (current.length < num) current.push('');
        if (current.length > num) current.length = num;
      } else {
        current.length = 0;
      }
      const updated = { ...prev, [key]: current };
      if (num === 0) delete updated[key];
      return updated;
    });
  };

  // Top Count input handler
  const handleTopCountChange = (val) => {
    const cleanVal = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setCount(val);

    const targetMonthKey = activePostMonth || generatedMonths.find(m => m.isCurrent)?.key || generatedMonths[12]?.key;
    if (targetMonthKey) {
      setActivePostMonth(targetMonthKey);

      const num = Number(cleanVal) || 0;
      const newMonthCounts = { ...monthCounts, [targetMonthKey]: num };
      if (num === 0) delete newMonthCounts[targetMonthKey];
      setMonthCounts(newMonthCounts);

      setPostMonthPrices(prev => {
        const currentPrices = prev[targetMonthKey] ? [...prev[targetMonthKey]] : [];
        if (num > 0) {
          while (currentPrices.length < num) {
            currentPrices.push(category === 'Pre-registration' ? '1000' : '');
          }
          if (currentPrices.length > num) {
            currentPrices.length = num;
          }
        } else {
          currentPrices.length = 0;
        }

        const updated = { ...prev, [targetMonthKey]: currentPrices };
        if (num === 0) delete updated[targetMonthKey];

        if (category === 'Post-payment') {
          const totalAllMonths = Object.values(updated).reduce((sum, pricesArr) => {
            return sum + (pricesArr || []).reduce((mSum, p) => mSum + (Number(p) || 0), 0);
          }, 0);
          setAmount(totalAllMonths > 0 ? totalAllMonths.toString() : '');
        } else if (category === 'Pre-registration') {
          setAmount(num > 0 ? (num * 1000).toString() : '');
        }

        return updated;
      });

      setPostMonthEmployees(prev => {
        const current = prev[targetMonthKey] ? [...prev[targetMonthKey]] : [];
        if (num > 0) {
          while (current.length < num) current.push('');
          if (current.length > num) current.length = num;
        } else {
          current.length = 0;
        }
        const updated = { ...prev, [targetMonthKey]: current };
        if (num === 0) delete updated[targetMonthKey];
        return updated;
      });

      setPostMonthStudents(prev => {
        const current = prev[targetMonthKey] ? [...prev[targetMonthKey]] : [];
        if (num > 0) {
          while (current.length < num) current.push('');
          if (current.length > num) current.length = num;
        } else {
          current.length = 0;
        }
        const updated = { ...prev, [targetMonthKey]: current };
        if (num === 0) delete updated[targetMonthKey];
        return updated;
      });
    }
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
      const prices = postMonthPrices[key] || [];
      const emps = postMonthEmployees[key] || [];
      const students = postMonthStudents[key] || [];

      const detailsList = [];
      const num = Number(v) || 0;
      for (let i = 0; i < num; i++) {
        const p = prices[i];
        const emp = emps[i];
        const std = students[i];
        const parts = [];
        if (std) parts.push(`Student: ${std}`);
        if (emp) parts.push(`Emp: ${emp}`);
        if (p && Number(p) > 0) parts.push(`₹${p}`);
        if (parts.length > 0) {
          detailsList.push(parts.join(' - '));
        }
      }

      if (detailsList.length > 0) {
        return `${name}: ${v} (${detailsList.join('; ')})`;
      } else if (prices.some(p => Number(p) > 0)) {
        const validPrices = prices.filter(p => Number(p) > 0);
        return `${name}: ${v} (₹${validPrices.join(', ₹')})`;
      }
      return `${name}: ${v}`;
    }).join(', ');
  }, [monthCounts, postMonthPrices, postMonthEmployees, postMonthStudents, generatedMonths, category]);

  // Handler for individual price change in the active month
  const handleActiveMonthPriceChange = (index, val) => {
    if (!activePostMonth) return;
    const cleanVal = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    const currentPrices = postMonthPrices[activePostMonth] ? [...postMonthPrices[activePostMonth]] : [];
    currentPrices[index] = cleanVal;

    const newPostMonthPrices = {
      ...postMonthPrices,
      [activePostMonth]: currentPrices
    };
    setPostMonthPrices(newPostMonthPrices);

    // Sum across ALL months
    const totalAllMonths = Object.values(newPostMonthPrices).reduce((sum, pricesArr) => {
      return sum + (pricesArr || []).reduce((mSum, p) => mSum + (Number(p) || 0), 0);
    }, 0);

    setAmount(totalAllMonths > 0 ? totalAllMonths.toString() : '');
  };

  // Handler for individual employee change in the active month
  const handleActiveMonthEmployeeChange = (index, val) => {
    if (!activePostMonth) return;
    const currentEmps = postMonthEmployees[activePostMonth] ? [...postMonthEmployees[activePostMonth]] : [];
    currentEmps[index] = val;
    setPostMonthEmployees({
      ...postMonthEmployees,
      [activePostMonth]: currentEmps
    });
  };

  // Handler for individual student change in the active month
  const handleActiveMonthStudentChange = (index, val) => {
    if (!activePostMonth) return;
    const currentStudents = postMonthStudents[activePostMonth] ? [...postMonthStudents[activePostMonth]] : [];
    currentStudents[index] = val;
    setPostMonthStudents({
      ...postMonthStudents,
      [activePostMonth]: currentStudents
    });
  };

  // Overall total price across all months in Post-payment
  const totalAllPostPricesSum = useMemo(() => {
    return Object.values(postMonthPrices).reduce((sum, pricesArr) => {
      return sum + (pricesArr || []).reduce((mSum, p) => mSum + (Number(p) || 0), 0);
    }, 0);
  }, [postMonthPrices]);

  // Total price for active month only
  const activeMonthPricesSum = useMemo(() => {
    if (!activePostMonth || !postMonthPrices[activePostMonth]) return 0;
    return postMonthPrices[activePostMonth].reduce((sum, p) => sum + (Number(p) || 0), 0);
  }, [postMonthPrices, activePostMonth]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat === 'Pre-registration') {
      const numCount = Number(count) || (totalCalculatedMonthCount > 0 ? totalCalculatedMonthCount : 1);
      setAmount((numCount * 1000).toString());
    } else {
      // Post-payment
      setAmount(totalAllPostPricesSum > 0 ? totalAllPostPricesSum.toString() : '');
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

  const totalCount = useMemo(() => {
    return filteredData.reduce((sum, t) => sum + (Number(t.count) || 1), 0);
  }, [filteredData]);

  const totalPreRegCount = useMemo(() => {
    return filteredData
      .filter(t => t.category === 'Pre-registration')
      .reduce((sum, t) => sum + (Number(t.count) || 1), 0);
  }, [filteredData]);

  const totalPostPayCount = useMemo(() => {
    return filteredData
      .filter(t => t.category === 'Post-payment')
      .reduce((sum, t) => sum + (Number(t.count) || 1), 0);
  }, [filteredData]);

  const parseMonthFilter = (monthFilterStr, defaultDate, category, totalAmount, count) => {
    if (!monthFilterStr || typeof monthFilterStr !== 'string') {
      const d = new Date(defaultDate);
      const mName = !isNaN(d.getTime()) ? monthNames[d.getMonth()] : 'Unknown';
      const year = !isNaN(d.getTime()) ? d.getFullYear() : '';
      return [{
        monthKey: `${mName} ${year}`.trim(),
        monthName: mName,
        year: year,
        count: Number(count) || 1,
        category: category,
        amount: Number(totalAmount) || 0
      }];
    }

    const regex = /(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{4}))?\s*:\s*(\d+)(?:\s*\(([^)]+)\))?/gi;
    const results = [];
    let match;

    while ((match = regex.exec(monthFilterStr)) !== null) {
      const monthName = match[1];
      const year = match[2] || (defaultDate ? new Date(defaultDate).getFullYear() : '');
      const cnt = parseInt(match[3], 10) || 0;
      const pricesStr = match[4];
      
      let monthAmount = 0;
      if (pricesStr) {
        const priceNumbers = pricesStr.match(/\d[\d,]*/g);
        if (priceNumbers) {
          monthAmount = priceNumbers.reduce((sum, p) => sum + (parseInt(p.replace(/,/g, ''), 10) || 0), 0);
        }
      }
      
      if (monthAmount === 0 && cnt > 0) {
        if (category === 'Pre-registration') {
          monthAmount = cnt * 1000;
        } else {
          const totalCnt = Number(count) || cnt;
          monthAmount = totalCnt > 0 ? Math.round((Number(totalAmount) || 0) * (cnt / totalCnt)) : Number(totalAmount) || 0;
        }
      }

      results.push({
        monthKey: year ? `${monthName} ${year}` : monthName,
        monthName,
        year,
        count: cnt,
        category,
        amount: monthAmount
      });
    }

    if (results.length === 0) {
      const d = new Date(defaultDate);
      const mName = !isNaN(d.getTime()) ? monthNames[d.getMonth()] : 'Unknown';
      const year = !isNaN(d.getTime()) ? d.getFullYear() : '';
      return [{
        monthKey: `${mName} ${year}`.trim(),
        monthName: mName,
        year: year,
        count: Number(count) || 1,
        category: category,
        amount: Number(totalAmount) || 0
      }];
    }

    return results;
  };

  const monthWiseData = useMemo(() => {
    const monthMap = {};

    filteredData.forEach(t => {
      const parsedEntries = parseMonthFilter(t.monthFilter, t.date, t.category, t.amount, t.count);
      parsedEntries.forEach(entry => {
        const key = entry.monthKey;
        if (!monthMap[key]) {
          monthMap[key] = {
            monthKey: key,
            monthName: entry.monthName,
            year: entry.year,
            totalCount: 0,
            totalAmount: 0,
            preRegCount: 0,
            preRegAmount: 0,
            postPayCount: 0,
            postPayAmount: 0
          };
        }
        monthMap[key].totalCount += entry.count;
        monthMap[key].totalAmount += entry.amount;
        if (entry.category === 'Pre-registration') {
          monthMap[key].preRegCount += entry.count;
          monthMap[key].preRegAmount += entry.amount;
        } else if (entry.category === 'Post-payment') {
          monthMap[key].postPayCount += entry.count;
          monthMap[key].postPayAmount += entry.amount;
        }
      });
    });

    return Object.values(monthMap).sort((a, b) => {
      const yearA = parseInt(a.year, 10) || 0;
      const yearB = parseInt(b.year, 10) || 0;
      if (yearA !== yearB) return yearA - yearB;
      const mIdxA = monthNames.indexOf(a.monthName);
      const mIdxB = monthNames.indexOf(b.monthName);
      return mIdxA - mIdxB;
    });
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
    setPostMonthPrices({});
    setPostMonthEmployees({});
    setPostMonthStudents({});
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
    setPostMonthPrices({});
    setPostMonthEmployees({});
    setPostMonthStudents({});
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
        setPostMonthPrices({});
        setPostMonthEmployees({});
        setPostMonthStudents({});
        setDescription('');
      }
    }
  };

  // Active month info helper
  const activeMonthObj = generatedMonths.find(m => m.key === activePostMonth);
  const activeMonthPrices = (activePostMonth && postMonthPrices[activePostMonth]) || [];
  const monthsWithCounts = Object.entries(monthCounts).filter(([_, cnt]) => Number(cnt) > 0);

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
                onChange={(e) => handleTopCountChange(e.target.value)} 
                required 
                min="1"
                placeholder={category === 'Post-payment' ? 'Enter count or enter in months below' : 'Enter count or fill months below'}
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
                      const isActivePost = category === 'Post-payment' && activePostMonth === m.key;
                      return (
                        <div 
                          key={m.key} 
                          className={`month-card ${hasCount ? 'has-count' : ''} ${m.isCurrent ? 'is-current' : ''} ${isActivePost ? 'is-active-post-month' : ''}`}
                          onClick={() => {
                            if (category === 'Post-payment') {
                              setActivePostMonth(m.key);
                            }
                          }}
                          style={{ cursor: category === 'Post-payment' ? 'pointer' : 'default' }}
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
                            onFocus={() => {
                              if (category === 'Post-payment') {
                                setActivePostMonth(m.key);
                              }
                            }}
                            onChange={(e) => handleMonthCountChange(m.key, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic Price, Employee Name & Student Name Pop-Out Boxes */}
              {activeMonthPrices.length > 0 && (
                <div className="post-prices-container">
                  {/* Month Switcher Tabs if multiple months have counts */}
                  {monthsWithCounts.length > 1 && (
                    <div className="post-month-tabs">
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginRight: '4px' }}>
                        Months:
                      </span>
                      {monthsWithCounts.map(([mKey, cnt]) => {
                        const mObj = generatedMonths.find(m => m.key === mKey);
                        const isTabActive = activePostMonth === mKey;
                        return (
                          <button
                            key={mKey}
                            type="button"
                            className={`post-month-tab ${isTabActive ? 'active' : ''}`}
                            onClick={() => setActivePostMonth(mKey)}
                          >
                            <span>{mObj ? mObj.monthName : mKey}</span>
                            <span style={{ opacity: 0.8 }}>({cnt})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="post-prices-header">
                    <span className="post-prices-title">
                      {activeMonthObj ? `${activeMonthObj.monthName} ${activeMonthObj.year}` : 'Active Month'} — Details for {activeMonthPrices.length} Count{activeMonthPrices.length > 1 ? 's' : ''}:
                    </span>
                    <div className="post-prices-badges">
                      {monthsWithCounts.length > 1 && category === 'Post-payment' && (
                        <span className="post-prices-month-badge">
                          Month Total: ₹{activeMonthPricesSum.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="post-prices-total-badge">
                        Overall Total: ₹{category === 'Pre-registration' ? (Number(count || 1) * 1000).toLocaleString('en-IN') : totalAllPostPricesSum.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Datalist for Employee Name suggestions */}
                  <datalist id="employee-suggestions">
                    {(employees || []).map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                    ))}
                  </datalist>

                  <div className="post-entries-grid">
                    {activeMonthPrices.map((prc, idx) => (
                      <div key={idx} className="post-entry-card">
                        <div className="post-entry-card-header">
                          <span className="post-entry-number">Entry #{idx + 1}</span>
                        </div>

                        <div className="post-entry-fields">
                          {/* Price Box */}
                          <div className="post-field-group">
                            <label className="post-field-label">Price (₹)</label>
                            <div className="post-price-input-wrap">
                              <span className="post-price-currency">₹</span>
                              <input 
                                type="number" 
                                className="post-price-input" 
                                placeholder="0"
                                min="0"
                                value={prc}
                                onChange={(e) => handleActiveMonthPriceChange(idx, e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          {/* Employee Name Box */}
                          <div className="post-field-group">
                            <label className="post-field-label">Employee Name</label>
                            <input 
                              type="text" 
                              list="employee-suggestions"
                              className="post-text-input" 
                              placeholder="Choose or type employee"
                              value={postMonthEmployees[activePostMonth]?.[idx] || ''}
                              onChange={(e) => handleActiveMonthEmployeeChange(idx, e.target.value)}
                            />
                          </div>

                          {/* Student Name Box */}
                          <div className="post-field-group">
                            <label className="post-field-label">Student Name</label>
                            <input 
                              type="text" 
                              className="post-text-input" 
                              placeholder="Enter student name"
                              value={postMonthStudents[activePostMonth]?.[idx] || ''}
                              onChange={(e) => handleActiveMonthStudentChange(idx, e.target.value)}
                            />
                          </div>
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
            <>
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
                      <td>
                        <strong>{t.category}</strong>
                        {t.monthFilter && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: '500' }}>
                            📅 {t.monthFilter}
                          </div>
                        )}
                      </td>
                      <td><span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{t.count || 1}</span></td>
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
                    <td colSpan="2" style={{ textAlign: 'right', fontWeight: '700', padding: '16px' }}>Total:</td>
                    <td style={{ fontWeight: '800', fontSize: '1.05rem', padding: '16px', color: 'var(--primary-color)' }}>
                      {totalCount}
                    </td>
                    <td className="text-success" style={{ fontWeight: '800', fontSize: '1.1rem', padding: '16px' }}>
                      +₹{totalIncome.toLocaleString('en-IN')}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>

              {/* Month-Wise Total Count Breakdown Display */}
              <div className="recent-income-month-summary">
                <div className="month-summary-header">
                  <div className="month-summary-title-wrap">
                    <h4 className="month-summary-title">
                      <Calendar size={18} className="text-primary" /> Month-Wise Count Summary
                    </h4>
                    <span className="month-summary-subtitle">
                      Total count and revenue breakdown per month for selected period ({viewMode})
                    </span>
                  </div>
                  <div className="month-summary-total-pills">
                    <div className="summary-pill total-pill">
                      <span className="pill-label">Total Count:</span>
                      <span className="pill-value">{totalCount}</span>
                    </div>
                    <div className="summary-pill prereg-pill">
                      <span className="pill-label">Pre-Reg:</span>
                      <span className="pill-value">{totalPreRegCount}</span>
                    </div>
                    <div className="summary-pill postpay-pill">
                      <span className="pill-label">Post-Pay:</span>
                      <span className="pill-value">{totalPostPayCount}</span>
                    </div>
                    <div className="summary-pill amount-pill">
                      <span className="pill-label">Total Income:</span>
                      <span className="pill-value">+₹{totalIncome.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="month-summary-cards-grid">
                  {monthWiseData.map(m => (
                    <div key={m.monthKey} className="month-summary-card">
                      <div className="m-card-top">
                        <div className="m-card-month-badge">
                          <span className="m-card-name">{m.monthName}</span>
                          {m.year && <span className="m-card-year">{m.year}</span>}
                        </div>
                        <div className="m-card-count-badge">
                          <span className="count-label">Count:</span>
                          <span className="count-val">{m.totalCount}</span>
                        </div>
                      </div>

                      <div className="m-card-divider" />

                      <div className="m-card-breakdown">
                        <div className="m-breakdown-row">
                          <span className="m-breakdown-cat">
                            <span className="cat-dot prereg-dot" /> Pre-registration:
                          </span>
                          <span className="m-breakdown-val">
                            <strong>{m.preRegCount}</strong>
                            {m.preRegAmount > 0 && <span className="m-breakdown-subamt"> (+₹{m.preRegAmount.toLocaleString('en-IN')})</span>}
                          </span>
                        </div>
                        <div className="m-breakdown-row">
                          <span className="m-breakdown-cat">
                            <span className="cat-dot postpay-dot" /> Post-payment:
                          </span>
                          <span className="m-breakdown-val">
                            <strong>{m.postPayCount}</strong>
                            {m.postPayAmount > 0 && <span className="m-breakdown-subamt"> (+₹{m.postPayAmount.toLocaleString('en-IN')})</span>}
                          </span>
                        </div>
                      </div>

                      <div className="m-card-footer">
                        <span className="m-card-total-label">Month Total:</span>
                        <span className="m-card-total-amount">+₹{m.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomeForm;
