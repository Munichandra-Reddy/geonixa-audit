"use client";
import { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { PieChart, Plus } from 'lucide-react';
import './FormStyles.css';

const ExpenseForm = () => {
  const { transactions, addTransaction, employees, mentors } = useContext(AppContext);
  const [category, setCategory] = useState('Rent');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMentor, setSelectedMentor] = useState('');
  const [expenseMonthYear, setExpenseMonthYear] = useState(new Date().toISOString().substring(0, 7));
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const filteredData = useMemo(() => {
    const targetDate = new Date(selectedDate);
    
    return expenseTransactions.filter(t => {
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
  }, [expenseTransactions, viewMode, selectedDate]);

  const totalExpense = useMemo(() => {
    return filteredData.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    
    const isSalary = category === 'Employee Salary' || category === 'Mentor Salary';
    
    let monthYearDisplay = expenseMonthYear;
    if (expenseMonthYear) {
      const [y, m] = expenseMonthYear.split('-');
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const mName = monthNames[parseInt(m, 10) - 1] || m;
      monthYearDisplay = `${mName} ${y}`;
    }

    let desc = description;
    if (isSalary) {
      desc = `Salary for ${category === 'Employee Salary' ? (selectedEmployee || 'Employee') : (selectedMentor || 'Mentor')} (${monthYearDisplay})`;
    } else if (monthYearDisplay) {
      desc = description ? `${description} (${monthYearDisplay})` : `${category} (${monthYearDisplay})`;
    }

    const txDate = expenseMonthYear ? `${expenseMonthYear}-01T12:00:00.000Z` : new Date().toISOString();

    addTransaction({ 
      type: 'expense',
      category, 
      amount: Number(amount), 
      monthFilter: monthYearDisplay,
      description: desc,
      date: txDate
    });
    setAmount('');
    setDescription('');
    setSelectedEmployee('');
    setSelectedMentor('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <PieChart className="text-danger" size={32} />
        <h2>Log Expenses</h2>
      </div>

      <div className="form-grid">
        <div className="form-card glass-panel">
          <h3>Record New Expense</h3>
          <form onSubmit={handleSubmit} className="entry-form">
            <div className="input-group">
              <label>Expense Category</label>
              <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Rent">Rent</option>
                <option value="Refund">Refund</option>
                <option value="Employee Salary">Employee Salary</option>
                <option value="Mentor Salary">Mentor Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {category === 'Employee Salary' && (
              <div className="input-group">
                <label>Select Employee</label>
                <select className="input-field" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} required>
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>
            )}

            {category === 'Mentor Salary' && (
              <div className="input-group">
                <label>Select Mentor</label>
                <select className="input-field" value={selectedMentor} onChange={(e) => setSelectedMentor(e.target.value)} required>
                  <option value="">-- Choose Mentor --</option>
                  {mentors.map(mentor => (
                    <option key={mentor.id} value={mentor.name}>{mentor.name} ({mentor.course})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Month & Year with Calendar Picker for every category */}
            <div className="input-group">
              <label>{(category === 'Employee Salary' || category === 'Mentor Salary') ? 'Salary Month & Year' : 'Month & Year'}</label>
              <input 
                type="month" 
                className="input-field" 
                value={expenseMonthYear} 
                onChange={(e) => setExpenseMonthYear(e.target.value)} 
                required 
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
            
            {category !== 'Employee Salary' && category !== 'Mentor Salary' && (
              <div className="input-group">
                <label>Description (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>
            )}

            <button type="submit" className="btn-primary btn-danger">
              <Plus size={18} /> Record Expense
            </button>
          </form>
        </div>

        <div className="list-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0 }}>Recent Expenses</h3>
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
            <p className="text-secondary">No expenses logged yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice().reverse().map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td><strong>{t.category}</strong></td>
                    <td>{t.description || '-'}</td>
                    <td className="text-danger font-semibold">-₹{t.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: '700', padding: '16px' }}>Total Expenses:</td>
                  <td className="text-danger" style={{ fontWeight: '700', fontSize: '1.1rem', padding: '16px' }}>-₹{totalExpense.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
