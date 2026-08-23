import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Search } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { db, addLog } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import type { Teacher, User } from '../types';
import { hashPassword } from '../utils/security';

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', employee_code: '', password: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = () => setTeachers(db.teachers.getAll());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (db.users.getAll().some(u => u.email === form.email)) { alert('Email already exists.'); return; }

    const newUser: User = {
      id: Date.now(),
      email: form.email,
      password_hash: hashPassword(form.password || 'teacher123'),
      role: 'teacher',
      first_name: form.first_name,
      last_name: form.last_name,
      created_at: new Date().toISOString(),
    };
    db.users.add(newUser);

    const newTeacher: Teacher = {
      id: Date.now() + 1,
      user_id: newUser.id,
      employee_code: form.employee_code || `TCH-${Date.now()}`,
      first_name: form.first_name,
      last_name: form.last_name,
      created_at: new Date().toISOString(),
    };
    db.teachers.add(newTeacher);
    addLog('Create Teacher', `Created teacher ${form.employee_code}`, user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
    setModal(false);
    setForm({ first_name: '', last_name: '', email: '', employee_code: '', password: '' });
    loadData();
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this teacher?')) return;
    const tch = db.teachers.getById(id);
    if (tch) db.users.delete(tch.user_id);
    db.teachers.delete(id);
    addLog('Delete Teacher', `Deleted teacher ID ${id}`, user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
    loadData();
  };

  const filtered = teachers.filter(t => `${t.first_name} ${t.last_name} ${t.employee_code}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <SidebarLayout>
      <div className="page-header">
        <h1>Teachers</h1>
        <button className="btn btn-primary btn-sm" onClick={()=>setModal(true)}><Plus size={16} /> Add Teacher</button>
      </div>
      <div className="form-group" style={{maxWidth:320,marginBottom:16}}>
        <div style={{position:'relative'}}>
          <Search size={16} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--text-light)'}} />
          <input placeholder="Search teachers..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:40}} />
        </div>
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>{t.employee_code}</td>
                  <td><strong>{t.first_name} {t.last_name}</strong></td>
                  <td><button className="btn btn-sm btn-danger" onClick={()=>handleDelete(t.id)}><Trash2 size={14}/></button></td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={3} style={{textAlign:'center',color:'var(--text-light)',padding:40}}>No teachers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Add Teacher</h3><button className="close-btn" onClick={()=>setModal(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>First Name</label><input value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} required /></div>
                  <div className="form-group"><label>Last Name</label><input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} required /></div>
                </div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
                <div className="form-group"><label>Employee Code</label><input value={form.employee_code} onChange={e=>setForm({...form,employee_code:e.target.value})} placeholder="Auto-generated if empty" /></div>
                <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Default: teacher123" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
