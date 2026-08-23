import React, { useEffect, useState } from 'react';
import { Award, BookOpen } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { db, getRoleData, getSubjectsForStudent } from '../utils/storage';
import type { Student, Grade, Subject } from '../types';
import { getFinalGrade, getGWA, getGradeDescriptor, getPassFail, getSemesterFinal, getSubjectFinalGrade } from '../utils/grading';

export default function StudentGrades() {
  const roleData = getRoleData() as Student | null;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gwa, setGwa] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleData) { setLoading(false); return; }
    const allSubjects = getSubjectsForStudent(roleData, db.subjects.getAll());
    const myGrades = db.grades.getAll().filter(g => g.student_id === roleData.id);
    setSubjects(allSubjects);
    setGrades(myGrades);

    const finalGrades = allSubjects.map(sub => getSubjectFinalGrade(myGrades, sub.id));
    setGwa(getGWA(finalGrades));
    setLoading(false);
  }, [roleData]);

  if (loading) return <SidebarLayout><div className="loading-screen">Loading grades...</div></SidebarLayout>;

  if (!roleData) {
    return (
      <SidebarLayout>
        <div className="alert alert-danger" style={{margin:24}}>
          <strong>Student data not found.</strong><br/>
          Please log out and log in again. If you registered as a student, make sure your account was properly created.
        </div>
      </SidebarLayout>
    );
  }

  const pf = gwa !== null ? getPassFail(gwa) : null;

  return (
    <SidebarLayout>
      <div className="page-header grades-page-header"><h1>My Grades</h1></div>

      {gwa !== null && (
        <div className="stats-grid grades-summary" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginBottom: 20 }}>
          <div className="stat-card grade-summary-card grade-summary-gwa">
            <h3><Award size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> GWA</h3>
            <div className="value" style={{ color: gwa >= 75 ? 'var(--success)' : 'var(--danger)', fontSize: '2.2rem' }}>{gwa}</div>
          </div>
          <div className={`stat-card grade-summary-card grade-summary-status ${pf?.pass ? 'is-passed' : 'is-failed'}`}>
            <h3>Overall Remarks</h3>
            <div className="value grade-status-value" style={{ fontSize: '1.4rem' }}>
              <span className="grade-status-dot" />{pf?.text || '—'}
            </div>
          </div>
          <div className="stat-card grade-summary-card grade-summary-descriptor" style={{ gridColumn: '1 / -1' }}>
            <h3>Performance Descriptor</h3>
            <div className="value" style={{ fontSize: '1.3rem' }}>{getGradeDescriptor(gwa)}</div>
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="card grades-empty-state" style={{textAlign:'center',padding:40,color:'var(--text-light)'}}>
          <BookOpen size={48} style={{marginBottom:16,opacity:0.5}} />
          <h3>No subjects available</h3>
          <p>Subjects have not been set up yet. Please contact your teacher or administrator.</p>
        </div>
      ) : (
        <div className="card grades-table-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th><th>Track</th><th>Q1</th><th>Q2</th><th>1st Sem</th><th>Q3</th><th>Q4</th><th>2nd Sem</th><th>Final</th><th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(sub => {
                  const q1 = grades.find(g => g.subject_id === sub.id && g.quarter === 1)?.transmuted_grade ?? null;
                  const q2 = grades.find(g => g.subject_id === sub.id && g.quarter === 2)?.transmuted_grade ?? null;
                  const q3 = grades.find(g => g.subject_id === sub.id && g.quarter === 3)?.transmuted_grade ?? null;
                  const q4 = grades.find(g => g.subject_id === sub.id && g.quarter === 4)?.transmuted_grade ?? null;
                  const s1 = getSemesterFinal(q1, q2);
                  const s2 = getSemesterFinal(q3, q4);
                  const final = getFinalGrade(s1, s2);
                  const pf = final !== null ? getPassFail(final) : null;
                  const descriptor = final !== null ? getGradeDescriptor(final) : null;
                  return (
                    <tr className={`grade-row ${pf ? (pf.pass ? 'grade-row-passed' : 'grade-row-failed') : 'grade-row-pending'}`} key={sub.id}>
                      <td><strong>{sub.code}</strong><br/><small>{sub.name}</small></td>
                      <td><span className={`badge badge-${sub.track_type}`}>{sub.track_type.replace('_', ' ')}</span></td>
                      <td style={{textAlign:'center'}}>{q1 ?? '—'}</td>
                      <td style={{textAlign:'center'}}>{q2 ?? '—'}</td>
                      <td style={{textAlign:'center',fontWeight:700}}>{s1 ?? '—'}</td>
                      <td style={{textAlign:'center'}}>{q3 ?? '—'}</td>
                      <td style={{textAlign:'center'}}>{q4 ?? '—'}</td>
                      <td style={{textAlign:'center',fontWeight:700}}>{s2 ?? '—'}</td>
                      <td className="grade-final-cell" style={{textAlign:'center',fontWeight:700}}>{final ?? '—'}</td>
                      <td className="grade-remarks" style={{textAlign:'center'}}>
                        {pf && descriptor ? <><span className={`grade-status-pill ${pf.pass ? 'is-passed' : 'is-failed'}`}><span className="grade-status-dot" />{pf.text}</span><small className="grade-descriptor">{descriptor}</small></> : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
