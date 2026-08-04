"use client";
import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, Plus, Edit2, Trash2, X } from 'lucide-react';
import './FormStyles.css';

const Employees = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useContext(AppContext);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !role || !baseSalary) return;
    
    if (editingId) {
      const existing = employees.find(emp => emp.id === editingId);
      updateEmployee({
        id: editingId,
        name,
        role,
        baseSalary: Number(baseSalary),
        joinDate: existing?.joinDate || new Date().toISOString()
      });
      setEditingId(null);
    } else {
      addEmployee({
        name,
        role,
        baseSalary: Number(baseSalary),
        joinDate: new Date().toISOString()
      });
    }

    setName('');
    setRole('');
    setBaseSalary('');
  };

  const handleEdit = (emp) => {
    setEditingId(emp.id);
    setName(emp.name);
    setRole(emp.role);
    setBaseSalary(emp.baseSalary?.toString() || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setBaseSalary('');
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee record?")) {
      deleteEmployee(id);
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Users className="text-primary" size={32} />
        <h2>Employee Management</h2>
      </div>

      <div className="form-grid">
        <div className="form-card glass-panel">
          <h3>{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
          <form onSubmit={handleSubmit} className="entry-form">
            <div className="input-group">
              <label>Employee Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Role / Position</label>
              <input 
                type="text" 
                className="input-field" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Base Salary (₹)</label>
              <input 
                type="number" 
                className="input-field" 
                value={baseSalary} 
                onChange={(e) => setBaseSalary(e.target.value)} 
                required 
                min="0"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button type="submit" className="btn-primary">
                {editingId ? <Edit2 size={18} /> : <Plus size={18} />} {editingId ? 'Update Employee' : 'Add Employee'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <X size={18} /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="list-card glass-panel">
          <h3>Current Employees</h3>
          {employees.length === 0 ? (
            <p className="text-secondary">No employees added yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Base Salary (₹)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td><strong>{emp.name}</strong></td>
                    <td>{emp.role}</td>
                    <td>₹{emp.baseSalary.toLocaleString('en-IN')} / mo</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        type="button" 
                        onClick={() => handleEdit(emp)} 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          color: 'var(--primary-color)', 
                          marginRight: '16px',
                          padding: '4px',
                          transition: 'transform 0.15s ease'
                        }} 
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(emp.id)} 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          color: 'var(--danger-color)',
                          padding: '4px',
                          transition: 'transform 0.15s ease'
                        }} 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
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

export default Employees;
