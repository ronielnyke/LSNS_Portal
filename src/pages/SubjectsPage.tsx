import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { db, addLog } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import type { Subject } from '../types';
import { TRACK_WEIGHTS } from '../utils/grading';

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ 
    code: '', 
    name: '', 
    track_type: 'core' as Subject['track_type'], 
    description: '',
    grade_level: 'Grade 11' as string,
  });

  useEffect(() => { loadData(); }, []);
  const loadData = () => setSubjects(db.subjects.getAll());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSubject: Subject = {
      id: Date.now(),
      code: form.code,
      name: form.name,
      track_type: form.track_type,
      description: form.description,
      grade_level: form.grade_level,
      created_at: new Date().toISOString(),
    };
    db.subjects.add(newSubject);
    addLog('Create Subject', `Created subject ${form.code}`, user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
    setModal(false);
    setForm({ code: '', name: '', track_type: 'core', description: '', grade_level: 'Grade 11' });
    loadData();
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this subject?')) return;
    db.subjects.delete(id);
    addLog('Delete Subject', `Deleted subject ID ${id}`, user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
    loadData();
  };

  return (
    <SidebarLayout>
      <div className="page-header">
        <h1>Subjects</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><Plus size={16} /> Add Subject</button>
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Grade Level</th><th>Track Type</th><th>Weights</th><th>Actions</th></tr></thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id}>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.grade_level}</td>
                  <td><span className={`badge badge-${s.track_type}`}>{s.track_type.replace('_', ' ')}</span></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{TRACK_WEIGHTS[s.track_type].label}</td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
              {subjects.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 40 }}>No subjects</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add Subject</h3><button className="close-btn" onClick={() => setModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Subject Code</label><input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
                  <div className="form-group"><label>Subject Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Grade Level</label>
                    <select value={form.grade_level} onChange={e => setForm({...form, grade_level: e.target.value})}>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Track Type</label>
                    <select value={form.track_type} onChange={e => setForm({...form, track_type: e.target.value as Subject['track_type']})}>
                      <option value="core">Core Subjects</option>
                      <option value="academic_math">Academic (Math/Science/Languages)</option>
                      <option value="academic_research">Academic (Research/Business)</option>
                      <option value="tvl">TVL / Sports / Arts</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
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