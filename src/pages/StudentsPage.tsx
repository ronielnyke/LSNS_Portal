import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Search } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { useAuth } from '../hooks/useAuth';

const API = 'http://localhost:8080/api';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_code: string;
  grade_level: string;
  subject_ids: number[];
  created_at: string;
}

interface Subject {
  id: number;
  code: string;
  name: string;
}

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    student_code: '',
    grade_level: 'Grade 11',
    password: '',
    subject_ids: [] as number[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadSubjects();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/students`);
      const result = await res.json();
      if (result.success) setStudents(result.data);
    } catch {
      alert('Server not running! Start: node server.cjs');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await fetch(`${API}/subjects`);
      const result = await res.json();
      if (result.success) setSubjects(result.data);
    } catch {
      // Subjects empty if server down
      setSubjects([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check duplicate email on create
    if (!editingId && students.some(s => s.email === form.email)) {
      alert('Email already exists.');
      return;
    }
    if (subjects.length > 0 && form.subject_ids.length === 0) {
      alert('Assign at least one subject.');
      return;
    }

    const url = editingId ? `${API}/students/${editingId}` : `${API}/students`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      
      if (result.success) {
        setModal(false);
        setEditingId(null);
        setForm({ first_name: '', last_name: '', email: '', student_code: '', grade_level: 'Grade 11', password: '', subject_ids: [] });
        loadData();
      } else {
        alert(result.error || 'Failed to save');
      }
    } catch {
      alert('Network error. Is the server running?');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await fetch(`${API}/students/${id}`, { method: 'DELETE' });
      loadData();
    } catch {
      alert('Delete failed');
    }
  };

  const handleEdit = (s: Student) => {
    setForm({
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
      student_code: s.student_code,
      grade_level: s.grade_level,
      password: '',
      subject_ids: s.subject_ids || []
    });
    setEditingId(s.id);
    setModal(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setForm({ first_name: '', last_name: '', email: '', student_code: '', grade_level: 'Grade 11', password: '', subject_ids: [] });
    setModal(true);
  };

  const filtered = students.filter(s => 
    `${s.first_name} ${s.last_name} ${s.student_code}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="page-header">
        <h1>Students</h1>
        <button className="btn btn-primary btn-sm" onClick={handleAddNew}>
          <Plus size={16} /> Add Student
        </button>
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
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{textAlign:'center',padding:40}}>Loading...</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td>{s.student_code}</td>
                  <td><strong>{s.first_name} {s.last_name}</strong></td>
                  <td>{s.grade_level}</td>
                  <td>
                    <button className="btn btn-sm" style={{marginRight:8}} onClick={()=>handleEdit(s)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(s.id)}>
                      <Trash2 size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length===0 && (
                <tr>
                  <td colSpan={4} style={{textAlign:'center',color:'var(--text-light)',padding:40}}>
                    {search ? 'No matching students' : 'No students found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Student' : 'Add Student'}</h3>
              <button className="close-btn" onClick={()=>{setModal(false);setEditingId(null);}}>
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Student Code</label>
                    <input value={form.student_code} onChange={e=>setForm({...form,student_code:e.target.value})} placeholder="Auto-generated if empty" />
                  </div>
                  <div className="form-group">
                    <label>Grade Level</label>
                    <select value={form.grade_level} onChange={e=>setForm({...form,grade_level:e.target.value})}>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                </div>
                {!editingId && (
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Default: student123" />
                  </div>
                )}
                <div className="form-group">
                  <label>Assigned Subjects <small>(choose 1 to 8)</small></label>
                  <div className="subject-assignment-grid">
                    {subjects.map(subject => (
                      <label className="subject-assignment-option" key={subject.id}>
                        <input 
                          type="checkbox" 
                          checked={form.subject_ids.includes(subject.id)} 
                          disabled={!form.subject_ids.includes(subject.id) && form.subject_ids.length >= 8} 
                          onChange={e => setForm({...form, subject_ids: e.target.checked ? [...form.subject_ids, subject.id] : form.subject_ids.filter(id => id !== subject.id)})} 
                        />
                        <span><strong>{subject.code}</strong><small>{subject.name}</small></span>
                      </label>
                    ))}
                    {subjects.length === 0 && <small className="text-muted">No subjects available.</small>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={()=>{setModal(false);setEditingId(null);}}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}