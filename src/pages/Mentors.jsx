"use client";
import { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import './FormStyles.css';

const Mentors = () => {
  const { mentors, addMentor, updateMentor, deleteMentor } = useContext(AppContext);
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [total, setTotal] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    return mentors.filter(mentor => {
      if (searchQuery && !mentor.name?.toLowerCase().includes(searchQuery.toLowerCase()) && !mentor.course?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [mentors, searchQuery]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, mentor) => sum + (mentor.total || 0), 0);
  }, [filteredData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !course || !total) return;
    
    if (editingId) {
      updateMentor({ id: editingId, name, course, total: Number(total), joinDate: new Date().toISOString() });
      setEditingId(null);
    } else {
      addMentor({ name, course, total: Number(total), joinDate: new Date().toISOString() });
    }
    
    setName('');
    setCourse('');
    setTotal('');
  };

  const handleEdit = (mentor) => {
    setEditingId(mentor.id);
    setName(mentor.name);
    setCourse(mentor.course);
    setTotal(mentor.total?.toString() || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this mentor record?")) {
      deleteMentor(id);
      if (editingId === id) {
        setEditingId(null);
        setName('');
        setCourse('');
        setTotal('');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Users className="text-primary" size={32} />
        <h2>Mentor Management</h2>
      </div>

      <div className="form-grid">
        <div className="form-card glass-panel">
          <h3>{editingId ? 'Edit Mentor' : 'Add New Mentor'}</h3>
          <form onSubmit={handleSubmit} className="entry-form">
            <div className="input-group">
              <label>Mentor Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Course</label>
              <input 
                type="text" 
                className="input-field" 
                value={course} 
                onChange={(e) => setCourse(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Total (₹)</label>
              <input 
                type="number" 
                className="input-field" 
                value={total} 
                onChange={(e) => setTotal(e.target.value)} 
                required 
                min="0"
              />
            </div>
            <button type="submit" className="btn-primary">
              {editingId ? <Edit2 size={18} /> : <Plus size={18} />} {editingId ? 'Update Mentor' : 'Add Mentor'}
            </button>
          </form>
        </div>

        <div className="list-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0 }}>Current Mentors</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search mentor..." 
                style={{ width: '200px', padding: '6px 12px' }} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>
          {filteredData.length === 0 ? (
            <p className="text-secondary">No mentors added yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mentor Name</th>
                  <th>Course</th>
                  <th>Total (₹)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice().reverse().map((mentor) => (
                  <tr key={mentor.id}>
                    <td><strong>{mentor.name}</strong></td>
                    <td>{mentor.course}</td>
                    <td>₹{mentor.total?.toLocaleString('en-IN') || 0}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" onClick={() => handleEdit(mentor)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: '16px' }} title="Edit"><Edit2 size={18} /></button>
                      <button type="button" onClick={() => handleDelete(mentor.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }} title="Delete"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" style={{ textAlign: 'right', fontWeight: '700', padding: '16px' }}>Total Amount:</td>
                  <td className="text-primary" style={{ fontWeight: '700', fontSize: '1.1rem', padding: '16px' }}>₹{totalAmount.toLocaleString('en-IN')}</td>
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

export default Mentors;
