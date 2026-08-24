import React, { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, ClipboardList, Bell, Award, BookOpen, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { announcementIsForRole, db, getRoleData, getSubjectsForStudent } from '../utils/storage';
import { getGWA, getPassFail, getSubjectFinalGrade } from '../utils/grading';
import type { Student } from '../types';

export default function StudentDashboard() {
  const roleData = getRoleData() as Student | null;
  const [gwa, setGwa] = useState<number | null>(null);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [gradesCount, setGradesCount] = useState(0);
  const [subjectResults, setSubjectResults] = useState<{ id: number; code: string; name: string; final: number | null }[]>([]);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleData) { setLoading(false); return; }
    const subjects = getSubjectsForStudent(roleData, db.subjects.getAll());
    setSubjectsCount(subjects.length);
    const grades = db.grades.getAll().filter(g => g.student_id === roleData.id);
    setGradesCount(grades.length);
    const attendance = db.attendance.getAll().filter(a => a.student_id === roleData.id);
    setAttendanceCount(attendance.length);

    const results = subjects.map(sub => ({ id: sub.id, code: sub.code, name: sub.name, final: getSubjectFinalGrade(grades, sub.id) }));
    setSubjectResults(results);
    const finals = results.map(result => result.final);
    setGwa(getGWA(finals));
    setCompletionPercent(results.length ? Math.round((results.filter(result => result.final !== null).length / results.length) * 100) : 0);
    setLoading(false);
  }, [roleData]);

  if (loading) return <SidebarLayout><div className="loading-screen">Loading dashboard...</div></SidebarLayout>;

  if (!roleData) {
    return (
      <SidebarLayout>
        <div className="alert alert-danger" style={{margin:24}}>
          <strong>Student data not found.</strong><br/>
          Please log out and log in again.
        </div>
      </SidebarLayout>
    );
  }

  const pf = gwa !== null ? getPassFail(gwa) : null;

  return (
    <SidebarLayout>
      <section className="student-hero">
        <div>
          <span className="student-dashboard-kicker">Academic overview</span>
          <h1>Welcome back, {roleData.first_name}</h1>
          <p>Track your academic progress, attendance, and school updates in one place.</p>
        </div>
        <div className="student-identity"><span>Student ID</span><strong>{roleData.student_code}</strong><small>Grade {roleData.grade_level}</small></div>
      </section>

      {roleData.academic_status === 'permanently_blocked' && (
        <section className="academic-reset-banner">
          <AlertTriangle size={24} />
          <div><strong>Academic status: Repeat First Semester</strong><span>Your graduation eligibility is suspended because the attendance drop-out was repeated after the second chance. Your attendance and grade history remain preserved.</span></div>
          <b>Semester 1</b>
        </section>
      )}

      <div className="stats-grid student-dashboard-grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))'}}>
        <div className="stat-card student-stat-card student-gwa-card" style={{borderTop:'4px solid #2563eb'}}>
          <Award size={24} style={{color:'#2563eb',marginBottom:8}} />
          <h3>General Weighted Average</h3>
          <div className="value" style={{color: gwa && gwa >= 75 ? '#16a34a' : '#dc2626', fontSize: '2.2rem'}}>{gwa ?? '—'}</div>
        </div>

        {pf && (
          <div className={`stat-card student-stat-card student-status-card ${pf.pass ? 'is-passed' : 'is-failed'}`} style={{borderTop:'4px solid #16a34a'}}>
            <BarChart3 size={24} style={{color:'#16a34a',marginBottom:8}} />
            <h3>Status</h3>
            <div className="value" style={{color: pf.pass ? '#16a34a' : '#dc2626', fontSize: '1.4rem'}}>{pf.text}</div>
          </div>
        )}

        <Link className="student-dashboard-link" to="/my-grades">
          <div className="stat-card student-stat-card" style={{borderTop:'4px solid #059669'}}>
            <BookOpen size={24} style={{color:'#059669',marginBottom:8}} />
            <h3>Subjects</h3>
            <div className="value" style={{color:'#059669'}}>{subjectsCount}</div>
            <ArrowUpRight className="student-card-arrow" size={16} />
          </div>
        </Link>

        <Link className="student-dashboard-link" to="/my-grades">
          <div className="stat-card student-stat-card" style={{borderTop:'4px solid #7c3aed'}}>
            <BarChart3 size={24} style={{color:'#7c3aed',marginBottom:8}} />
            <h3>Grades Recorded</h3>
            <div className="value" style={{color:'#7c3aed'}}>{gradesCount}</div>
            <ArrowUpRight className="student-card-arrow" size={16} />
          </div>
        </Link>

        <Link className="student-dashboard-link" to="/my-attendance">
          <div className="stat-card student-stat-card" style={{borderTop:'4px solid #d97706'}}>
            <ClipboardList size={24} style={{color:'#d97706',marginBottom:8}} />
            <h3>Attendance Records</h3>
            <div className="value" style={{color:'#d97706'}}>{attendanceCount}</div>
            <ArrowUpRight className="student-card-arrow" size={16} />
          </div>
        </Link>

        <Link className="student-dashboard-link" to="/announcements">
          <div className="stat-card student-stat-card" style={{borderTop:'4px solid #be185d'}}>
            <Bell size={24} style={{color:'#be185d',marginBottom:8}} />
            <h3>Announcements</h3>
            <div className="value" style={{color:'#be185d'}}>{db.announcements.getAll().filter(announcement => announcementIsForRole(announcement, 'student')).length}</div>
            <ArrowUpRight className="student-card-arrow" size={16} />
          </div>
        </Link>
      </div>

      <section className="student-subject-overview">
        <div className="student-subject-overview-header">
          <div><span className="student-dashboard-kicker">Complete subject breakdown</span><h2>My Subject Grades</h2></div>
          <span className="student-subject-completion"><CheckCircle2 size={15} /> {completionPercent}% complete</span>
        </div>
        <div className="student-subject-grid">
          {subjectResults.map(result => (
            <Link key={result.id} to="/my-grades" className={`student-subject-card ${result.final !== null ? 'is-complete' : 'is-pending'}`}>
              <div><strong>{result.code}</strong><span>{result.name}</span></div>
              <div className="student-subject-grade">{result.final ?? '—'}<small>{result.final !== null ? 'Final' : 'Pending'}</small></div>
            </Link>
          ))}
          {subjectResults.length === 0 && <div className="student-subject-empty">No subjects have been set up yet.</div>}
        </div>
        <div className="student-grade-progress-panel">
          <div className="student-grade-completion-ring" style={{ '--completion-angle': `${completionPercent * 3.6}deg` } as React.CSSProperties}>
            <div><strong>{completionPercent}%</strong><span>complete</span></div>
          </div>
          <div className="student-grade-progress-copy"><strong>{subjectResults.filter(result => result.final !== null).length} of {subjectResults.length} subjects complete</strong><span>Finish every quarter grade to reach 100% and unlock your complete GWA.</span></div>
        </div>
        <p className="student-gwa-note">GWA is the average of all subjects with complete Q1, Q2, Q3, and Q4 grades.</p>
      </section>
    </SidebarLayout>
  );
}