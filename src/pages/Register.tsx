import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, UserPlus, AlertTriangle, XCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { db, addLog } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import { hashPassword, getPasswordStrength } from '../utils/security';
import type { User, Student, Teacher } from '../types';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm: '',
    role: 'student' as 'student' | 'teacher', code: '', grade_level: 'Grade 11',
    section_id: null as number | null,
    subject_ids: [] as number[],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (strength.score < 5) { setError('Please create a Very Strong password with uppercase, lowercase, number, and symbol.'); return; }
    if (db.users.getAll().some(u => u.email === form.email)) { setError('Email already registered.'); return; }

    setLoading(true);
    setTimeout(() => {
      const newUser: User = {
        id: Date.now(),
        email: form.email,
        password_hash: hashPassword(form.password || 'student123'),
        role: form.role,
        first_name: form.first_name,
        last_name: form.last_name,
        created_at: new Date().toISOString(),
      };
      db.users.add(newUser);

      if (form.role === 'student') {
        const student: Student = {
          id: Date.now() + 1,
          user_id: newUser.id,
          student_code: form.code || `STU-${Date.now()}`,
          first_name: form.first_name,
          last_name: form.last_name,
          grade_level: form.grade_level,
          section_id: form.section_id,
          subject_ids: form.subject_ids,
          created_at: new Date().toISOString(),
          final_ban: false,
        };
        db.students.add(student);
      } else {
        const teacher: Teacher = {
          id: Date.now() + 1,
          user_id: newUser.id,
          employee_code: form.code || `TCH-${Date.now()}`,
          first_name: form.first_name,
          last_name: form.last_name,
          created_at: new Date().toISOString(),
        };
        db.teachers.add(teacher);
      }

      addLog('Register', `New ${form.role} registered: ${form.email}`, newUser.id, `${form.first_name} ${form.last_name}`);
      login(newUser);
      navigate(form.role === 'teacher' ? '/teacher' : '/student');
    }, 400);
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="alert alert-danger"><AlertTriangle size={16} style={{marginRight:6,verticalAlign:'middle'}}/>{error}</div>}
        <div className="form-row">
          <div className="form-group"><label>First Name</label><input value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} required /></div>
          <div className="form-group"><label>Last Name</label><input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} required /></div>
        </div>
        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
        <div className="form-row">
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value as any})}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div className="form-group">
            <label>{form.role === 'student' ? 'Student Code' : 'Employee Code'}</label>
            <input value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="Optional" />
          </div>
        </div>
        {form.role === 'student' && (
          <>
            <div className="form-group">
              <label>Grade Level</label>
              <select value={form.grade_level} onChange={e=>setForm({...form,grade_level:e.target.value})}>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>
            <div className="form-group">
              <label>Section</label>
              <select value={form.section_id ?? ''} onChange={e=>setForm({...form,section_id:e.target.value ? Number(e.target.value) : null})}>
                <option value="">Select a section...</option>
                {db.sections.getAll().map(section => (
                  <option key={section.id} value={section.id}>{section.name} (Grade {section.grade_level})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Subjects</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:'8px',padding:'10px',border:'2px solid var(--border)',borderRadius:'8px',background:'#fff'}}>
                {db.subjects.getAll().filter(sub => !sub.grade_level || sub.grade_level === form.grade_level).map(subject => (
                  <label key={subject.id} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'6px 12px',borderRadius:'999px',border:'1px solid var(--border)',background:form.subject_ids.includes(subject.id) ? 'var(--primary-light)' : '#f8fafc',color:form.subject_ids.includes(subject.id) ? 'var(--primary)' : 'var(--text)',fontSize:'0.85rem',cursor:'pointer',transition:'all 0.2s',userSelect:'none'}}>
                    <input type="checkbox" checked={form.subject_ids.includes(subject.id)} onChange={() => {
                      const ids = form.subject_ids.includes(subject.id)
                        ? form.subject_ids.filter(id => id !== subject.id)
                        : [...form.subject_ids, subject.id];
                      setForm({...form, subject_ids: ids});
                    }} style={{accentColor:'var(--primary)'}} />
                    {subject.code} — {subject.name}
                  </label>
                ))}
                {db.subjects.getAll().length === 0 && <span style={{color:'var(--text-light)',fontSize:'0.85rem'}}>No subjects available. Ask admin to add subjects.</span>}
              </div>
            </div>
          </>
        )}
        <div className="form-group">
          <label>Password</label>
          <div className="password-input-wrap"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /><button type="button" className="password-eye-button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          <div className="password-strength" style={{width:`${(strength.score/5)*100}%`,background:strength.color}} />
          <small style={{color:strength.color,fontSize:'0.75rem'}}>{strength.label}</small>
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <div className="password-input-wrap"><input type={showConfirmPassword ? 'text' : 'password'} value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} required /><button type="button" className="password-eye-button" onClick={() => setShowConfirmPassword(value => !value)} aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}>{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          {form.confirm && <div className={`password-match-indicator ${form.password === form.confirm ? 'matched' : 'mismatched'}`}><span />{form.password === form.confirm ? <><CheckCircle2 size={14} /> Passwords match</> : <><XCircle size={14} /> Passwords do not match</>}</div>}
        </div>
        <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={loading}>
          <UserPlus size={16} /> {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </form>
    </AuthLayout>
  );
}