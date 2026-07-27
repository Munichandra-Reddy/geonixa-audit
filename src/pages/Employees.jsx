"use client";
import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, Plus } from 'lucide-react';
import './FormStyles.css';

const Employees = () => {
  const { employees, addEmployee } = useContext(AppContext);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [baseSalary, setBaseSalary] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !role || !baseSalary) return;
    
    addEmployee({ name, role, baseSalary: Number(baseSalary), joinDate: new Date().toISOString() });
    setName('');
    setRole('');
    setBaseSalary('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Users className="text-primary" size={32} />
        <h2>Employee Management</h2>
      </div>

      <div className="form-grid">
        <div className="form-card glass-panel">
          <h3>Add New Employee</h3>
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
            <button type="submit" className="btn-primary">
              <Plus size={18} /> Add Employee
            </button>
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
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td><strong>{emp.name}</strong></td>
                    <td>{emp.role}</td>
                    <td>₹{emp.baseSalary.toLocaleString('en-IN')} / mo</td>
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
