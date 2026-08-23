import React, { useEffect, useState, useCallback } from 'react';
import { Save, X, Search, Edit3, GraduationCap, Layers3, CheckCircle2 } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { db, addLog, getSubjectsForStudent } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import type { Grade, Student, Subject } from '../types';
import { computeInitialGrade, getGWA, getSubjectFinalGrade, transmuteGrade, TRACK_WEIGHTS } from '../utils/grading';

export default function GradesPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    student_id: '', subject_id: '', quarter: '1' as '1'|'2'|'3'|'4',
    ww_score: '', ww_total: '100', pt_score: '', pt_total: '100', qa_score: '', qa_total: '100'
  });
  const [preview, setPreview] = useState<{initial: number; transmuted: number} | null>(null);

  const loadData = useCallback(() => {
    setStudents(db.students.getAll());
    setSubjects(db.subjects.getAll());
    setGrades(db.grades.getAll());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Live preview
  useEffect(() => {
    const subj = subjects.find(s => s.id === parseInt(form.subject_id));
    if (!subj || !form.ww_score || !form.pt_score || !form.qa_score) {
      setPreview(null);
      return;
    }
    const s = parseFloat(form.ww_score) || 0;
    const st = parseFloat(form.ww_total) || 1;
    const p = parseFloat(form.pt_score) || 0;
    const pt = parseFloat(form.pt_total) || 1;
    const q = parseFloat(form.qa_score) || 0;
    const qt = parseFloat(form.qa_total) || 1;
    const initial = computeInitialGrade(s, st, p, pt, q, qt, subj.track_type);
    setPreview({ initial: parseFloat(initial.toFixed(2)), transmuted: transmuteGrade(initial) });
  }, [form, subjects]);

  const openModal = (stu: Student, sub: Subject, quarter: 1|2|3|4) => {
    const existing = grades.find(g => g.student_id === stu.id && g.subject_id === sub.id && g.quarter === quarter);
    if (existing) {
      setForm({
        student_id: String(stu.id),
        subject_id: String(sub.id),
        quarter: String(quarter) as '1'|'2'|'3'|'4',
        ww_score: String(existing.ww_score),
        ww_total: String(existing.ww_total),
        pt_score: String(existing.pt_score),
        pt_total: String(existing.pt_total),
        qa_score: String(existing.qa_score),
        qa_total: String(existing.qa_total),
      });
    } else {
      setForm({
        student_id: String(stu.id),
        subject_id: String(sub.id),
        quarter: String(quarter) as '1'|'2'|'3'|'4',
        ww_score: '', ww_total: '100', pt_score: '', pt_total: '100', qa_score: '', qa_total: '100'
      });
    }
    setErrorMsg('');
    setModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!user) { setErrorMsg('Not logged in.'); return; }

    const studentId = parseInt(form.student_id);
    const subjectId = parseInt(form.subject_id);
    const quarter = parseInt(form.quarter) as 1|2|3|4;

    if (isNaN(studentId) || isNaN(subjectId)) { setErrorMsg('Please select student and subject.'); return; }

    const subj = subjects.find(s => s.id === subjectId);
    if (!subj) { setErrorMsg('Subject not found.'); return; }

    const ww = parseFloat(form.ww_score);
    const pt = parseFloat(form.pt_score);
    const qa = parseFloat(form.qa_score);
    if (isNaN(ww) || isNaN(pt) || isNaN(qa)) { setErrorMsg('Please enter valid scores.'); return; }

    const wwTotal = parseFloat(form.ww_total) || 100;
    const ptTotal = parseFloat(form.pt_total) || 100;
    const qaTotal = parseFloat(form.qa_total) || 100;

    const initial = computeInitialGrade(ww, wwTotal, pt, ptTotal, qa, qaTotal, subj.track_type);
    const transmuted = transmuteGrade(initial);

    const existing = grades.find(g => g.student_id === studentId && g.subject_id === subjectId && g.quarter === quarter);

    if (existing) {
      db.grades.update(existing.id, g => ({
        ...g,
        ww_score: ww, ww_total: wwTotal,
        pt_score: pt, pt_total: ptTotal,
        qa_score: qa, qa_total: qaTotal,
        initial_grade: initial, transmuted_grade: transmuted
      }));
      addLog('Update Grade', `Updated Q${quarter} for student ${studentId}, subject ${subjectId}`, user.id, `${user.first_name} ${user.last_name}`);
    } else {
      const newGrade: Grade = {
        id: Date.now(),
        student_id: studentId,
        subject_id: subjectId,
        quarter,
        ww_score: ww, ww_total: wwTotal,
        pt_score: pt, pt_total: ptTotal,
        qa_score: qa, qa_total: qaTotal,
        initial_grade: initial,
        transmuted_grade: transmuted,
        recorded_by: user.id,
        created_at: new Date().toISOString()
      };
      db.grades.add(newGrade);
      addLog('Create Grade', `Added Q${quarter} for student ${studentId}, subject ${subjectId}`, user.id, `${user.first_name} ${user.last_name}`);
    }

    setModal(false);
    loadData();
  };

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name} ${s.student_code}`.toLowerCase().includes(search.toLowerCase())
  );

  const getGrade = (studentId: number, subjectId: number, quarter: number) => {
    return grades.find(g => g.student_id === studentId && g.subject_id === subjectId && g.quarter === quarter);
  };

  return (
    <SidebarLayout>
      <section className="teacher-grades-hero">
        <div>
          <span className="teacher-grades-kicker">Assessment workspace</span>
          <h1>Record Student Grades</h1>
          <p>Choose a student, select a quarter, and enter scores with a live transmuted-grade preview.</p>
        </div>
        <div className="teacher-grades-hero-icon"><GraduationCap size={30} /></div>
      </section>

      <div className="teacher-grades-toolbar">
        <div className="teacher-grades-search form-group">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
        </div>
        <div className="teacher-grades-count"><strong>{filteredStudents.length}</strong><span>students shown</span></div>
      </div>

      <div className="teacher-student-grid">
        {filteredStudents.map((stu, studentIndex) => {
          const studentSubjects = getSubjectsForStudent(stu, subjects);
          const studentGrades = grades.filter(g => g.student_id === stu.id);
          const subjectFinals = studentSubjects.map(subject => getSubjectFinalGrade(studentGrades, subject.id));
          const completedSubjects = subjectFinals.filter(final => final !== null).length;
          const studentGwa = getGWA(subjectFinals);
          return (
            <article key={stu.id} className="teacher-student-card" style={{ animationDelay: `${Math.min(studentIndex * 55, 400)}ms` }}>
              <div className="teacher-student-card-header">
                <div className="teacher-student-avatar"><GraduationCap size={20} /></div>
                <div className="teacher-student-identity"><h2>{stu.first_name} {stu.last_name}</h2><span>{stu.student_code} <i /> {stu.grade_level}</span></div>
                <div className="teacher-student-progress"><strong>{studentGwa ?? '—'}</strong><span>GWA</span></div>
              </div>
              <div className="teacher-student-summary"><span><CheckCircle2 size={14} /> {completedSubjects} / {studentSubjects.length} subjects final</span><strong>{studentGrades.length} quarter scores</strong></div>
              <div className="teacher-subject-list">
                {studentSubjects.map(sub => (
                  <div className="teacher-subject-row" key={`${stu.id}-${sub.id}`}>
                    <div className="teacher-subject-name"><strong>{sub.code}</strong><span>{TRACK_WEIGHTS[sub.track_type].label.split(' (')[0]}</span><em>{getSubjectFinalGrade(studentGrades, sub.id) ?? 'Final pending'}</em></div>
                    <div className="teacher-quarter-actions">
                      {[1, 2, 3, 4].map(quarter => {
                        const grade = getGrade(stu.id, sub.id, quarter);
                        return <button key={quarter} className={`teacher-quarter-button ${grade ? 'has-grade' : ''}`} onClick={() => openModal(stu, sub, quarter as 1|2|3|4)} aria-label={`Record ${sub.code} quarter ${quarter}`}><span>Q{quarter}</span>{grade ? <strong>{grade.transmuted_grade}</strong> : <small>+</small>}</button>;
                      })}
                    </div>
                  </div>
                ))}
                {studentSubjects.length === 0 && <div className="teacher-grades-empty"><Layers3 size={22} />Assign subjects to this student first.</div>}
              </div>
              <div className="teacher-student-card-footer"><CheckCircle2 size={14} /> Click a quarter to add or update a score</div>
            </article>
          );
        })}
        {filteredStudents.length === 0 && <div className="teacher-grades-empty teacher-grades-empty-large"><Search size={30} /><strong>No students found</strong><span>Add students or change your search.</span></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3><Edit3 size={16} style={{display:'inline',marginRight:6,verticalAlign:'middle'}}/> Record Grade — Q{form.quarter}</h3>
              <button className="close-btn" onClick={() => setModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {errorMsg && <div className="alert alert-danger" style={{marginBottom:16}}>{errorMsg}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label>Student</label>
                    <select value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} required disabled>
                      <option value="">Select</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <select value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} required disabled>
                      <option value="">Select</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Quarter</label>
                  <select value={form.quarter} onChange={e => setForm({...form, quarter: e.target.value as '1'|'2'|'3'|'4'})}>
                    <option value="1">Quarter 1</option>
                    <option value="2">Quarter 2</option>
                    <option value="3">Quarter 3</option>
                    <option value="4">Quarter 4</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group"><label>WW Score</label><input type="number" min="0" step="0.01" value={form.ww_score} onChange={e => setForm({...form, ww_score: e.target.value})} required /></div>
                  <div className="form-group"><label>WW Total</label><input type="number" min="1" value={form.ww_total} onChange={e => setForm({...form, ww_total: e.target.value})} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>PT Score</label><input type="number" min="0" step="0.01" value={form.pt_score} onChange={e => setForm({...form, pt_score: e.target.value})} required /></div>
                  <div className="form-group"><label>PT Total</label><input type="number" min="1" value={form.pt_total} onChange={e => setForm({...form, pt_total: e.target.value})} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>QA Score</label><input type="number" min="0" step="0.01" value={form.qa_score} onChange={e => setForm({...form, qa_score: e.target.value})} required /></div>
                  <div className="form-group"><label>QA Total</label><input type="number" min="1" value={form.qa_total} onChange={e => setForm({...form, qa_total: e.target.value})} required /></div>
                </div>

                {preview && (
                  <div className="grade-preview">
                    <div className="grade-preview-row"><span>Initial Grade:</span><strong>{preview.initial}</strong></div>
                    <div className="grade-preview-row"><span>Transmuted Grade:</span><strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{preview.transmuted}</strong></div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm"><Save size={14} /> Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
