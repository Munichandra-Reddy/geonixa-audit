"use client";
import { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Target, Plus, Edit2, Trash2, TrendingUp, Award, CheckCircle2, Clock, AlertCircle, Search, Calendar, Filter } from 'lucide-react';
import './FormStyles.css';
import './EmployeeTargetSheet.css';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const defaultTargets = [
  {
    id: 'target-1',
    employeeId: 'emp-1',
    employeeName: 'Rahul Sharma',
    role: 'Senior Academic Counselor',
    month: '2026-08',
    targetCount: 15,
    achievedCount: 12,
    targetRevenue: 60000,
    achievedRevenue: 52000,
    notes: 'Focus on Web Development course pre-registrations'
  },
  {
    id: 'target-2',
    employeeId: 'emp-2',
    employeeName: 'Priya Patel',
    role: 'Admissions Lead',
    month: '2026-08',
    targetCount: 12,
    achievedCount: 12,
    targetRevenue: 50000,
    achievedRevenue: 54000,
    notes: 'Target achieved ahead of schedule!'
  },
  {
    id: 'target-3',
    employeeId: 'emp-3',
    employeeName: 'Anil Kumar',
    role: 'Counselor',
    month: '2026-08',
    targetCount: 10,
    achievedCount: 6,
    targetRevenue: 40000,
    achievedRevenue: 28000,
    notes: 'Following up with pending post-payment leads'
  }
];

const EmployeeTargetSheet = () => {
  const { employees, transactions } = useContext(AppContext);

  // Targets State with localStorage persistence
  const [targets, setTargets] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('geonixa_employee_targets');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing saved targets", e);
        }
      }
    }
    return defaultTargets;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('geonixa_employee_targets', JSON.stringify(targets));
    }
  }, [targets]);

  // Form State
  const [employeeName, setEmployeeName] = useState('');
  const [role, setRole] = useState('');
  const [targetMonth, setTargetMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [targetCount, setTargetCount] = useState('');
  const [achievedCount, setAchievedCount] = useState('');
  const [targetRevenue, setTargetRevenue] = useState('');
  const [achievedRevenue, setAchievedRevenue] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Filter & Search State
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle employee selection to auto-fill role
  const handleEmployeeSelect = (name) => {
    setEmployeeName(name);
    const emp = employees.find(e => e.name?.toLowerCase() === name?.toLowerCase());
    if (emp && emp.role) {
      setRole(emp.role);
    }
  };

  // Calculate actual achievements from transactions if possible
  const employeeActualsFromIncome = useMemo(() => {
    const map = {};
    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const text = t.monthFilter || t.description || '';
        employees.forEach(emp => {
          if (text.toLowerCase().includes(emp.name.toLowerCase())) {
            if (!map[emp.name]) {
              map[emp.name] = { count: 0, revenue: 0 };
            }
            map[emp.name].count += Number(t.count) || 1;
            map[emp.name].revenue += Number(t.amount) || 0;
          }
        });
      });
    return map;
  }, [transactions, employees]);

  // Filtered target records
  const filteredTargets = useMemo(() => {
    return targets.filter(t => {
      if (selectedMonthFilter !== 'all' && t.month !== selectedMonthFilter) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = t.employeeName?.toLowerCase().includes(q);
        const matchRole = t.role?.toLowerCase().includes(q);
        const matchNotes = t.notes?.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchNotes) return false;
      }
      return true;
    });
  }, [targets, selectedMonthFilter, searchQuery]);

  // Overall Statistics for selected filter
  const stats = useMemo(() => {
    const totalTargetCount = filteredTargets.reduce((sum, t) => sum + (Number(t.targetCount) || 0), 0);
    const totalAchievedCount = filteredTargets.reduce((sum, t) => sum + (Number(t.achievedCount) || 0), 0);
    const totalTargetRev = filteredTargets.reduce((sum, t) => sum + (Number(t.targetRevenue) || 0), 0);
    const totalAchievedRev = filteredTargets.reduce((sum, t) => sum + (Number(t.achievedRevenue) || 0), 0);

    const countProgress = totalTargetCount > 0 ? Math.round((totalAchievedCount / totalTargetCount) * 100) : 0;
    const revProgress = totalTargetRev > 0 ? Math.round((totalAchievedRev / totalTargetRev) * 100) : 0;

    let topPerformer = null;
    let topRate = -1;
    filteredTargets.forEach(t => {
      const rate = Number(t.targetRevenue) > 0 ? (Number(t.achievedRevenue) / Number(t.targetRevenue)) : 0;
      if (rate > topRate) {
        topRate = rate;
        topPerformer = t;
      }
    });

    return {
      totalTargetCount,
      totalAchievedCount,
      totalTargetRev,
      totalAchievedRev,
      countProgress,
      revProgress,
      topPerformer: topPerformer ? topPerformer.employeeName : 'N/A'
    };
  }, [filteredTargets]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeName || !targetCount || !targetRevenue) return;

    const parsedTargetCount = Number(targetCount) || 0;
    const parsedAchievedCount = achievedCount !== '' ? Number(achievedCount) : 0;
    const parsedTargetRev = Number(targetRevenue) || 0;
    const parsedAchievedRev = achievedRevenue !== '' ? Number(achievedRevenue) : 0;

    if (editingId) {
      setTargets(targets.map(t => t.id === editingId ? {
        ...t,
        employeeName,
        role: role || 'Counselor',
        month: targetMonth,
        targetCount: parsedTargetCount,
        achievedCount: parsedAchievedCount,
        targetRevenue: parsedTargetRev,
        achievedRevenue: parsedAchievedRev,
        notes
      } : t));
      setEditingId(null);
    } else {
      const newTarget = {
        id: `target-${Date.now()}`,
        employeeName,
        role: role || 'Counselor',
        month: targetMonth,
        targetCount: parsedTargetCount,
        achievedCount: parsedAchievedCount,
        targetRevenue: parsedTargetRev,
        achievedRevenue: parsedAchievedRev,
        notes
      };
      setTargets([newTarget, ...targets]);
    }

    setEmployeeName('');
    setRole('');
    setTargetCount('');
    setAchievedCount('');
    setTargetRevenue('');
    setAchievedRevenue('');
    setNotes('');
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setEmployeeName(t.employeeName);
    setRole(t.role || '');
    setTargetMonth(t.month);
    setTargetCount(t.targetCount.toString());
    setAchievedCount(t.achievedCount.toString());
    setTargetRevenue(t.targetRevenue.toString());
    setAchievedRevenue(t.achievedRevenue.toString());
    setNotes(t.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this target entry?")) {
      setTargets(targets.filter(t => t.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setEmployeeName('');
        setRole('');
        setTargetCount('');
        setAchievedCount('');
        setTargetRevenue('');
        setAchievedRevenue('');
        setNotes('');
      }
    }
  };

  // Helper to format month nicely e.g. "2026-08" -> "August 2026"
  const formatMonth = (monthKey) => {
    if (!monthKey) return '';
    const [y, m] = monthKey.split('-');
    const mIdx = parseInt(m, 10) - 1;
    return `${monthNames[mIdx] || m} ${y}`;
  };

  // Distinct months in targets for filter dropdown
  const availableMonths = useMemo(() => {
    const set = new Set(targets.map(t => t.month));
    const nowKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    set.add(nowKey);
    return Array.from(set).sort().reverse();
  }, [targets]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <Target className="text-primary" size={32} />
        <h2>Employee Target Sheet</h2>
      </div>

      {/* Summary KPI Cards */}
      <div className="target-kpi-grid">
        <div className="target-kpi-card glass-panel">
          <div className="target-kpi-icon-wrap count-icon">
            <TrendingUp size={24} />
          </div>
          <div className="target-kpi-content">
            <span className="target-kpi-label">Lead / Count Target</span>
            <div className="target-kpi-value-row">
              <span className="target-kpi-value">{stats.totalAchievedCount}</span>
              <span className="target-kpi-sub">/ {stats.totalTargetCount}</span>
            </div>
            <div className="target-progress-bar-wrap">
              <div 
                className="target-progress-bar count-bar" 
                style={{ width: `${Math.min(stats.countProgress, 100)}%` }}
              />
            </div>
            <span className="target-kpi-percent">{stats.countProgress}% Achieved</span>
          </div>
        </div>

        <div className="target-kpi-card glass-panel">
          <div className="target-kpi-icon-wrap revenue-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="target-kpi-content">
            <span className="target-kpi-label">Revenue Target</span>
            <div className="target-kpi-value-row">
              <span className="target-kpi-value">₹{stats.totalAchievedRev.toLocaleString('en-IN')}</span>
              <span className="target-kpi-sub">/ ₹{stats.totalTargetRev.toLocaleString('en-IN')}</span>
            </div>
            <div className="target-progress-bar-wrap">
              <div 
                className="target-progress-bar rev-bar" 
                style={{ width: `${Math.min(stats.revProgress, 100)}%` }}
              />
            </div>
            <span className="target-kpi-percent">{stats.revProgress}% Achieved</span>
          </div>
        </div>

        <div className="target-kpi-card glass-panel">
          <div className="target-kpi-icon-wrap performer-icon">
            <Award size={24} />
          </div>
          <div className="target-kpi-content">
            <span className="target-kpi-label">Top Performer</span>
            <span className="target-kpi-value highlight-text">{stats.topPerformer}</span>
            <span className="target-kpi-sub" style={{ marginTop: '6px' }}>Highest target completion</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Target Form & Target Sheet Table */}
      <div className="form-grid">
        {/* Target Form */}
        <div className="form-card glass-panel">
          <h3>{editingId ? 'Edit Employee Target' : 'Set Employee Target'}</h3>
          <form onSubmit={handleSubmit} className="entry-form">
            {/* Employee Selector / Input */}
            <div className="input-group">
              <label>Employee Name</label>
              <input 
                type="text" 
                list="target-emp-list"
                className="input-field" 
                placeholder="Select or enter employee"
                value={employeeName} 
                onChange={(e) => handleEmployeeSelect(e.target.value)} 
                required 
              />
              <datalist id="target-emp-list">
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                ))}
              </datalist>
            </div>

            {/* Role */}
            <div className="input-group">
              <label>Designation / Role</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Academic Counselor"
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
              />
            </div>

            {/* Target Month */}
            <div className="input-group">
              <label>Target Month</label>
              <input 
                type="month" 
                className="input-field" 
                value={targetMonth} 
                onChange={(e) => setTargetMonth(e.target.value)} 
                required 
              />
            </div>

            {/* Count Target & Achieved */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label>Target Count</label>
                <input 
                  type="number" 
                  min="0"
                  className="input-field" 
                  placeholder="e.g. 15"
                  value={targetCount} 
                  onChange={(e) => setTargetCount(e.target.value)} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Achieved Count</label>
                <input 
                  type="number" 
                  min="0"
                  className="input-field" 
                  placeholder="0"
                  value={achievedCount} 
                  onChange={(e) => setAchievedCount(e.target.value)} 
                />
              </div>
            </div>

            {/* Revenue Target & Achieved */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label>Target Revenue (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  className="input-field" 
                  placeholder="e.g. 50000"
                  value={targetRevenue} 
                  onChange={(e) => setTargetRevenue(e.target.value)} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Achieved Rev (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  className="input-field" 
                  placeholder="0"
                  value={achievedRevenue} 
                  onChange={(e) => setAchievedRevenue(e.target.value)} 
                />
              </div>
            </div>

            {/* Notes */}
            <div className="input-group">
              <label>Notes / Strategy</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Optional remarks or focus area"
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>

            <button type="submit" className="btn-primary submit-btn">
              {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
              <span>{editingId ? 'Update Target' : 'Set Target'}</span>
            </button>
            {editingId && (
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ marginTop: '8px' }}
                onClick={() => {
                  setEditingId(null);
                  setEmployeeName('');
                  setRole('');
                  setTargetCount('');
                  setAchievedCount('');
                  setTargetRevenue('');
                  setAchievedRevenue('');
                  setNotes('');
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* Target Sheet Table */}
        <div className="table-card glass-panel">
          <div className="target-table-header-wrap">
            <div className="target-table-title">
              <h3>Employee Target Performance Sheet</h3>
              <p className="table-subtitle">Track targets, leads, and revenue conversion per employee</p>
            </div>

            {/* Filter & Search Controls */}
            <div className="target-controls">
              <div className="target-search-wrap">
                <Search size={16} className="target-search-icon" />
                <input 
                  type="text"
                  placeholder="Search employee..."
                  className="target-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="target-filter-wrap">
                <Calendar size={16} />
                <select 
                  className="target-month-select"
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                >
                  <option value="all">All Months</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{formatMonth(m)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Count Progress</th>
                  <th>Revenue Progress</th>
                  <th>Performance Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No targets found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTargets.map((t) => {
                    const cTarget = Number(t.targetCount) || 1;
                    const cAchieved = Number(t.achievedCount) || 0;
                    const cPercent = Math.round((cAchieved / cTarget) * 100);

                    const rTarget = Number(t.targetRevenue) || 1;
                    const rAchieved = Number(t.achievedRevenue) || 0;
                    const rPercent = Math.round((rAchieved / rTarget) * 100);

                    let statusClass = 'status-pending';
                    let statusLabel = 'In Progress';
                    if (rPercent >= 100 || cPercent >= 100) {
                      statusClass = 'status-achieved';
                      statusLabel = 'Achieved 🎯';
                    } else if (rPercent >= 75 || cPercent >= 75) {
                      statusClass = 'status-ontrack';
                      statusLabel = 'On Track 🚀';
                    } else if (rPercent >= 40 || cPercent >= 40) {
                      statusClass = 'status-attention';
                      statusLabel = 'Needs Push ⚠️';
                    }

                    return (
                      <tr key={t.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{t.employeeName}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t.role}</span>
                          </div>
                        </td>
                        <td>
                          <span className="target-month-badge">{formatMonth(t.month)}</span>
                        </td>
                        <td>
                          <div className="target-cell-progress">
                            <div className="target-cell-numbers">
                              <span style={{ fontWeight: '700' }}>{cAchieved}</span>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}> / {cTarget}</span>
                              <span className="target-pct-pill">{cPercent}%</span>
                            </div>
                            <div className="target-mini-bar-wrap">
                              <div 
                                className="target-mini-bar count" 
                                style={{ width: `${Math.min(cPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="target-cell-progress">
                            <div className="target-cell-numbers">
                              <span style={{ fontWeight: '700', color: 'var(--success-color)' }}>₹{rAchieved.toLocaleString('en-IN')}</span>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}> / ₹{rTarget.toLocaleString('en-IN')}</span>
                              <span className="target-pct-pill">{rPercent}%</span>
                            </div>
                            <div className="target-mini-bar-wrap">
                              <div 
                                className="target-mini-bar rev" 
                                style={{ width: `${Math.min(rPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`target-status-tag ${statusClass}`}>{statusLabel}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {t.notes || '—'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="icon-btn edit-btn" onClick={() => handleEdit(t)} title="Edit Target">
                              <Edit2 size={16} />
                            </button>
                            <button className="icon-btn delete-btn" onClick={() => handleDelete(t.id)} title="Delete Target">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTargetSheet;
