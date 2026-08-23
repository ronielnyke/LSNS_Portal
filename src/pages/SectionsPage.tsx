import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { db, addLog } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import type { Section } from '../types';

export default function SectionsPage() {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', grade_level: 'Grade 11' });

  useEffect(() => { loadData(); }, []);
  const loadData = () => setSections(db.sections.getAll());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSection: Section = {
      id: Date.now(),
      name: form.name,
      grade_level: form.grade_level,
      created_at: new Date().toISOString(),
    };
    db.sections.add(newSection);
    addLog('Create Section', `Created section ${form.name}`, user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
    setModal(false);
    setForm({ name: '', grade_level: 'Grade 11' });
    loadData();
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this section?')) return;
    db.sections.delete(id);
    addLog('Delete Section', `Deleted section ID ${id}`, user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
    loadData();
  };

  return (
    <SidebarLayout>
      <div className="page-header">
        <h1>Sections</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><Plus size={16} /> Add Section</button>
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Grade Level</th><th>Actions</th></tr></thead>
            <tbody>
              {sections.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.grade_level}</td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
              {sections.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 40 }}>No sections</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add Section</h3><button className="close-btn" onClick={() => setModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Section Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div className="form-group">
                  <label>Grade Level</label>
                  <select value={form.grade_level} onChange={e => setForm({...form, grade_level: e.target.value})}>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
