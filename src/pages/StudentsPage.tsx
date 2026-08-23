import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Search } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { db, addLog } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import type { Student, User } from '../types';
import { hashPassword } from '../utils/security';

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', student_code: '', grade_level: 'Grade 11', password: '', subject_ids: [] as number[] });
  const subjects = db.subjects.getAll();

  useEffect(() => { loadData(); }, []);
  const loadData = () => setStudents(db.students.getAll());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (db.users.getAll().some(u => u.email === form.email)) { alert('Email already exists.'); return; }
    if (subjects.length > 0 && form.subject_ids.length === 0) { alert('Assign at least one subject.'); return; }

    const newUser: User = {
      id: Date.now(),
      email: form.email,
      password_hash: hashPassword(form.password || 'student123'),
      role: 'student',
      first_name: form.first_name,
      last_name: form.last_name,
      created_at: new Date().toISOString(),
    };
    db.users.add(newUser);

    const newStudent: Student = {
      id: Date.now() + 1,
      user_id: newUser.id,
      student_code: form.student_code || `STU-${Date.now()}`,
      first_name: form.first_name,
      last_name: form.last_name,
      grade_level: form.grade_level,
      section_id: null,
      subject_ids: form.subject_ids,
      created_at: new Date().toISOString(),
    };
    db.students.add(newStudent);
    addLog('Create Student', `Created student ${form.student_code}`, user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
    setModal(false);
    setForm({ first_name: '', last_name: '', email: '', student_code: '', grade_level: 'Grade 11', password: '', subject_ids: [] });
    loadData();
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this student?')) return;
    const stu = db.students.getById(id);
    if (stu) db.users.delete(stu.user_id);
    db.students.delete(id);
    addLog('Delete Student', `Deleted student ID ${id}`, user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
    loadData();
  };

  const filtered = students.filter(s => `${s.first_name} ${s.last_name} ${s.student_code}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <SidebarLayout>
      <div className="page-header">
        <h1>Students</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><Plus size={16} /> Add Student</button>
      </div>
      <div className="form-group" style={{maxWidth:320,marginBottom:16}}>
        <div style={{position:'relative'}}>
          <Search size={16} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--text-light)'}} />
          <input placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:40}} />
        </div>
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Grade</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>{s.student_code}</td>
                  <td><strong>{s.first_name} {s.last_name}</strong></td>
                  <td>{s.grade_level}</td>
                  <td><button className="btn btn-sm btn-danger" onClick={()=>handleDelete(s.id)}><Trash2 size={14}/></button></td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={4} style={{textAlign:'center',color:'var(--text-light)',padding:40}}>No students found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Add Student</h3><button className="close-btn" onClick={()=>setModal(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>First Name</label><input value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} required /></div>
                  <div className="form-group"><label>Last Name</label><input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} required /></div>
                </div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>Student Code</label><input value={form.student_code} onChange={e=>setForm({...form,student_code:e.target.value})} placeholder="Auto-generated if empty" /></div>
                  <div className="form-group"><label>Grade Level</label>
                    <select value={form.grade_level} onChange={e=>setForm({...form,grade_level:e.target.value})}>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Default: student123" /></div>
                <div className="form-group">
                  <label>Assigned Subjects <small>(choose 1 to 8)</small></label>
                  <div className="subject-assignment-grid">
                    {subjects.map(subject => (
                      <label className="subject-assignment-option" key={subject.id}>
                        <input type="checkbox" checked={form.subject_ids.includes(subject.id)} disabled={!form.subject_ids.includes(subject.id) && form.subject_ids.length >= 8} onChange={e => setForm({...form, subject_ids: e.target.checked ? [...form.subject_ids, subject.id] : form.subject_ids.filter(id => id !== subject.id)})} />
                        <span><strong>{subject.code}</strong><small>{subject.name}</small></span>
                      </label>
                    ))}
                    {subjects.length === 0 && <small className="text-muted">Create subjects first.</small>}
                  </div>
                </div>
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
