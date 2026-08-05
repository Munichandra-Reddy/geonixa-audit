"use client";
import { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Target, 
  Search, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Receipt, 
  ArrowUpDown, 
  Users,
  X,
  FileSpreadsheet
} from 'lucide-react';
import './FormStyles.css';
import './EmployeeTargetSheet.css';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EmployeeTargetSheet = () => {
  const { employees, transactions } = useContext(AppContext);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'yearly' | 'custom' | 'all'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'settled'
  const [sortBy, setSortBy] = useState('totalAmount_desc'); // 'totalAmount_desc' | 'preReg_desc' | 'pending_desc' | 'name_asc'

  // Income transactions only
  const incomeTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'income');
  }, [transactions]);

  // Filter transactions based on date/period filter
  const filteredTransactions = useMemo(() => {
    const targetDate = new Date(selectedDate);

    return incomeTransactions.filter(t => {
      if (!t.date) return true;
      const tDate = new Date(t.date);
      if (isNaN(tDate.getTime())) return true;

      if (viewMode === 'monthly') {
        return (
          tDate.getMonth() === targetDate.getMonth() &&
          tDate.getFullYear() === targetDate.getFullYear()
        );
      }
      if (viewMode === 'yearly') {
        return tDate.getFullYear() === targetDate.getFullYear();
      }
      if (viewMode === 'custom') {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return tDate >= start && tDate <= end;
      }
      return true; // 'all'
    });
  }, [incomeTransactions, viewMode, selectedDate, customStartDate, customEndDate]);

  // Parse transaction breakdown to attribute counts and amounts to employees
  const employeeData = useMemo(() => {
    // Initialize map with all registered employees
    const empMap = {};

    employees.forEach(emp => {
      empMap[emp.name.toLowerCase().trim()] = {
        id: emp.id,
        name: emp.name,
        role: emp.role || 'Staff Member',
        preRegCount: 0,
        preRegAmount: 0,
        postPayCount: 0,
        postPayAmount: 0,
        hasExplicitLogs: false
      };
    });

    // Process each filtered transaction
    filteredTransactions.forEach(tx => {
      const isPre = tx.category === 'Pre-registration';
      const isPost = tx.category === 'Post-payment';
      const txAmount = Number(tx.amount) || 0;
      const txCount = Number(tx.count) || 1;
      const monthFilterStr = tx.monthFilter || '';
      const descStr = tx.description || '';
      const combinedText = `${monthFilterStr} ${descStr}`.toLowerCase();

      // Check if employee name directly appears in combinedText
      const matchingEmployees = employees.filter(emp => {
        return combinedText.includes(emp.name.toLowerCase().trim());
      });

      if (matchingEmployees.length === 1) {
        // Exactly one employee matched in the transaction text
        const targetEmp = matchingEmployees[0];
        const key = targetEmp.name.toLowerCase().trim();
        if (empMap[key]) {
          empMap[key].hasExplicitLogs = true;
          if (isPre) {
            empMap[key].preRegCount += txCount;
            empMap[key].preRegAmount += txAmount;
          } else if (isPost) {
            empMap[key].postPayCount += txCount;
            empMap[key].postPayAmount += txAmount;
          }
        }
      } else if (matchingEmployees.length > 1) {
        // Multiple employees in one batch transaction - divide or attribute based on mentions
        const countPerEmp = Math.max(1, Math.floor(txCount / matchingEmployees.length));
        const amountPerEmp = Math.round(txAmount / matchingEmployees.length);

        matchingEmployees.forEach(emp => {
          const key = emp.name.toLowerCase().trim();
          if (empMap[key]) {
            empMap[key].hasExplicitLogs = true;
            if (isPre) {
              empMap[key].preRegCount += countPerEmp;
              empMap[key].preRegAmount += amountPerEmp;
            } else if (isPost) {
              empMap[key].postPayCount += countPerEmp;
              empMap[key].postPayAmount += amountPerEmp;
            }
          }
        });
      }
    });

    // Convert to array
    const list = Object.values(empMap).map(emp => {
      const pendingCount = Math.max(0, emp.preRegCount - emp.postPayCount);
      const totalAmount = emp.preRegAmount + emp.postPayAmount;
      const conversionRate = emp.preRegCount > 0 
        ? Math.min(100, Math.round((emp.postPayCount / emp.preRegCount) * 100))
        : (emp.postPayCount > 0 ? 100 : 0);

      return {
        ...emp,
        pendingCount,
        totalAmount,
        conversionRate
      };
    });

    return list;
  }, [employees, filteredTransactions]);

  // Filter and Sort Table Data
  const processedList = useMemo(() => {
    let result = [...employeeData];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === 'pending') {
      result = result.filter(item => item.pendingCount > 0);
    } else if (statusFilter === 'settled') {
      result = result.filter(item => item.pendingCount === 0 && (item.preRegCount > 0 || item.postPayCount > 0));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'totalAmount_desc') return b.totalAmount - a.totalAmount;
      if (sortBy === 'preReg_desc') return b.preRegCount - a.preRegCount;
      if (sortBy === 'postPay_desc') return b.postPayCount - a.postPayCount;
      if (sortBy === 'pending_desc') return b.pendingCount - a.pendingCount;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [employeeData, searchQuery, statusFilter, sortBy]);

  // Overall Grand Totals for summary cards & table footer
  const grandTotals = useMemo(() => {
    return processedList.reduce((acc, curr) => {
      acc.totalPreCount += curr.preRegCount;
      acc.totalPreAmount += curr.preRegAmount;
      acc.totalPostCount += curr.postPayCount;
      acc.totalPostAmount += curr.postPayAmount;
      acc.totalPendingCount += curr.pendingCount;
      acc.totalAmount += curr.totalAmount;
      return acc;
    }, {
      totalPreCount: 0,
      totalPreAmount: 0,
      totalPostCount: 0,
      totalPostAmount: 0,
      totalPendingCount: 0,
      totalAmount: 0
    });
  }, [processedList]);

  // Active Period Label Helper
  const periodLabel = useMemo(() => {
    if (viewMode === 'monthly') {
      const d = new Date(selectedDate);
      return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    }
    if (viewMode === 'yearly') {
      const d = new Date(selectedDate);
      return `Year ${d.getFullYear()}`;
    }
    if (viewMode === 'custom') {
      return `${customStartDate} to ${customEndDate}`;
    }
    return 'All Time';
  }, [viewMode, selectedDate, customStartDate, customEndDate]);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Target className="text-primary" size={32} />
          <div>
            <h2 style={{ margin: 0 }}>Employee Target Sheet</h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Detailed performance metrics, pre-registrations, post-payments & pending tracking
            </p>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="target-filter-card glass-panel">
        <div className="target-filter-row">
          {/* Search Input */}
          <div className="target-search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search employee name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="target-search-input-field"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Period Mode Selector Pills */}
          <div className="period-pills-wrap">
            <button 
              type="button" 
              className={`period-pill ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              Monthly
            </button>
            <button 
              type="button" 
              className={`period-pill ${viewMode === 'yearly' ? 'active' : ''}`}
              onClick={() => setViewMode('yearly')}
            >
              Yearly
            </button>
            <button 
              type="button" 
              className={`period-pill ${viewMode === 'custom' ? 'active' : ''}`}
              onClick={() => setViewMode('custom')}
            >
              Custom Range
            </button>
            <button 
              type="button" 
              className={`period-pill ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              All Time
            </button>
          </div>

          {/* Date Selector based on ViewMode */}
          {viewMode === 'monthly' && (
            <div className="date-picker-wrap">
              <Calendar size={16} />
              <input 
                type="month" 
                className="date-input-field"
                value={selectedDate ? selectedDate.substring(0, 7) : ''}
                onChange={(e) => setSelectedDate(`${e.target.value}-01`)}
              />
            </div>
          )}

          {viewMode === 'yearly' && (
            <div className="date-picker-wrap">
              <Calendar size={16} />
              <select 
                className="date-input-field"
                value={new Date(selectedDate).getFullYear()}
                onChange={(e) => setSelectedDate(`${e.target.value}-01-01`)}
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'custom' && (
            <div className="custom-range-wrap">
              <input 
                type="date" 
                className="date-input-field"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>to</span>
              <input 
                type="date" 
                className="date-input-field"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          )}

          {/* Sort By Dropdown */}
          <div className="sort-dropdown-wrap">
            <ArrowUpDown size={15} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select-field"
            >
              <option value="totalAmount_desc">Sort: Highest Amount</option>
              <option value="preReg_desc">Sort: Pre-registrations</option>
              <option value="postPay_desc">Sort: Post-payments</option>
              <option value="pending_desc">Sort: Most Pending</option>
              <option value="name_asc">Sort: Name (A-Z)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sort-dropdown-wrap">
            <Filter size={15} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sort-select-field"
            >
              <option value="all">Status: All Records</option>
              <option value="pending">Status: Has Pending</option>
              <option value="settled">Status: 0 Pending / Fully Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Details Table */}
      <div className="table-card glass-panel" style={{ marginTop: '20px' }}>
        <div className="target-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={22} className="text-primary" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Employee Performance & Target Sheet</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Showing {processedList.length} employee record{processedList.length !== 1 ? 's' : ''} for {periodLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="table-responsive" style={{ marginTop: '16px' }}>
          <table className="data-table target-sheet-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Employee Name</th>
                <th style={{ textAlign: 'center' }}>Pre-Registrations</th>
                <th style={{ textAlign: 'center' }}>Post-Payment</th>
                <th style={{ textAlign: 'center' }}>Pending (Pre − Post)</th>
                <th style={{ textAlign: 'right' }}>Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {processedList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No employee records match the filter for <strong>{periodLabel}</strong>.
                  </td>
                </tr>
              ) : (
                processedList.map((emp, index) => {
                  const hasPending = emp.pendingCount > 0;
                  const isSettled = emp.pendingCount === 0 && (emp.preRegCount > 0 || emp.postPayCount > 0);

                  return (
                    <tr key={emp.id || index} className="target-row">
                      {/* Serial Number */}
                      <td style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                        {index + 1}
                      </td>

                      {/* Employee Name & Role */}
                      <td>
                        <div className="emp-name-cell">
                          <div className="emp-avatar">
                            {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                          </div>
                          <div className="emp-info">
                            <span className="emp-name-text">{emp.name}</span>
                            <span className="emp-role-text">{emp.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* Pre-Registrations Count & Amount */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="count-amount-cell">
                          <span className="count-badge pre-badge">
                            {emp.preRegCount}
                          </span>
                          <span className="amount-subtext">
                            ₹{emp.preRegAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>

                      {/* Post-Payment Count & Amount */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="count-amount-cell">
                          <span className="count-badge post-badge">
                            {emp.postPayCount}
                          </span>
                          <span className="amount-subtext">
                            ₹{emp.postPayAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>

                      {/* Pending (Pre - Post) Count */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="pending-cell-wrap">
                          {hasPending ? (
                            <span className="pending-pill warning">
                              {emp.pendingCount} Pending
                            </span>
                          ) : isSettled ? (
                            <span className="pending-pill success">
                              0 (Settled)
                            </span>
                          ) : (
                            <span className="pending-pill neutral">
                              0
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="total-amount-cell">
                          <span className="total-amount-text">
                            ₹{emp.totalAmount.toLocaleString('en-IN')}
                          </span>
                          {emp.totalAmount > 0 && (
                            <span className="conversion-text">
                              {emp.conversionRate}% converted
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Row */}
            {processedList.length > 0 && (
              <tfoot>
                <tr className="target-total-footer-row">
                  <td colSpan="2" style={{ fontWeight: '800', fontSize: '0.98rem' }}>
                    Grand Total ({processedList.length} Employees):
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="count-amount-cell">
                      <span className="count-badge pre-badge footer-badge">
                        {grandTotals.totalPreCount}
                      </span>
                      <span className="amount-subtext footer-subtext">
                        ₹{grandTotals.totalPreAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="count-amount-cell">
                      <span className="count-badge post-badge footer-badge">
                        {grandTotals.totalPostCount}
                      </span>
                      <span className="amount-subtext footer-subtext">
                        ₹{grandTotals.totalPostAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`pending-pill ${grandTotals.totalPendingCount > 0 ? 'warning' : 'success'}`} style={{ fontWeight: '800' }}>
                      {grandTotals.totalPendingCount} Pending
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="footer-grand-total">
                      ₹{grandTotals.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTargetSheet;
