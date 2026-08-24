import React, { useRef, useState } from 'react';
import { Printer, FileText, Users, ClipboardList, GraduationCap, FileDown } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { db } from '../utils/storage';
import { getSemesterFinal, getFinalGrade, getGWA, getPassFail } from '../utils/grading';
import type { Student, Subject } from '../types';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'report_card' | 'class_record' | 'attendance'>('report_card');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const reportCardRef = useRef<HTMLDivElement>(null);

  const students = db.students.getAll();
  const subjects = db.subjects.getAll();
  const grades = db.grades.getAll();
  const attendance = db.attendance.getAll();

  const student = students.find(s => s.id === parseInt(selectedStudent));
  const studentSection = student ? db.sections.getAll().find(section => section.id === student.section_id) : undefined;
  const handlePrint = () => {
    const hasReport = activeTab === 'report_card' ? Boolean(student) : activeTab === 'class_record' ? Boolean(selectedSubject) : Boolean(student);
    if (!hasReport) {
      window.alert(activeTab === 'class_record' ? 'Please select a subject first.' : 'Please select a student first.');
      return;
    }
    window.print();
  };

  const handleExcelExport = () => {
    const report = reportCardRef.current;
    const hasReport = activeTab === 'report_card' ? Boolean(student) : activeTab === 'class_record' ? Boolean(selectedSubject) : Boolean(student);
    if (!hasReport || !report) {
      window.alert(activeTab === 'class_record' ? 'Please select a subject first.' : 'Please select a student first.');
      return;
    }

    const excelStyles = `
      @page { size: A4 portrait; margin: 0.45in; }
      body { font-family: Arial, sans-serif; color: #172033; margin: 0; }
      .report-card { width: 100%; padding: 0; }
      .report-card-header { text-align: center; border-bottom: 3px double #172033; padding-bottom: 12px; }
      .report-school-brand, .report-summary-row, .report-attendance-summary, .report-signatures { display: table; width: 100%; table-layout: fixed; border-collapse: collapse; }
      .report-school-brand > *, .report-summary-row > div, .report-attendance-summary > div, .report-signatures > div { display: table-cell; vertical-align: middle; }
      .report-school-logo { width: 70px; height: 58px; text-align: center; }
      .report-school-logo img { width: 52px; height: 52px; }
      .report-card-header h2 { color: #0f4265; margin: 3px 0; }
      .report-card-header p, .report-republic { font-size: 11px; margin: 3px; }
      .report-card-title { margin-top: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
      .report-card-info { display: table; width: 100%; table-layout: fixed; border-collapse: collapse; border: 1px solid #aebdca; margin: 14px 0; }
      .report-card-info > div { display: table-cell; width: 16.66%; min-height: 0; padding: 7px; border: 1px solid #c5d0da; vertical-align: top; }
      .report-card-info span, .report-summary-row span, .report-attendance-summary span { display: block; color: #536579; font-size: 9px; text-transform: uppercase; }
      .report-card-info strong { display: block; margin-top: 3px; font-size: 10px; }
      .report-section-label { padding: 7px 10px; background: #e7f3fa; border: 1px solid #aebdca; font-weight: bold; text-transform: uppercase; font-size: 10px; }
      .report-table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 9px; }
      .report-table th, .report-table td { border: 1px solid #aebdca; padding: 6px 4px; text-align: center; vertical-align: middle; }
      .report-table th { background: #f0f6fa; font-weight: bold; }
      .report-table th:first-child, .report-table td:first-child { width: 22%; text-align: left; }
      .report-table th:last-child, .report-table td:last-child { width: 14%; }
      .report-table .report-subject { text-align: left; }
      .report-subject small { display: block; color: #536579; }
      .report-summary-row, .report-attendance-summary { margin-top: 12px; }
      .report-summary-row > div, .report-attendance-summary > div { padding: 7px; border: 1px solid #aebdca; }
      .report-signatures { margin-top: 42px; }
      .report-signatures > div { width: 50%; text-align: center; border-top: 1px solid #172033; padding-top: 7px; }
      .report-signatures span { display: block; font-size: 9px; color: #536579; }
      .report-note { font-size: 9px; color: #536579; font-style: italic; }
      .no-print { display: none !important; }
    `;
    const documentHtml = `<!DOCTYPE html><html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"><meta name="ProgId" content="Excel.Sheet"><meta name="Generator" content="Student Management System"><title>Student Report</title><style>${excelStyles}</style></head><body>${report.outerHTML}</body></html>`;
    const blob = new Blob([documentHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `student-report-${student?.student_code ?? 'record'}.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const getStudentGrades = (sid: number) => {
    return subjects.map(sub => {
      const sg = grades.filter(g => g.student_id === sid && g.subject_id === sub.id);
      const q1 = sg.find(g => g.quarter === 1)?.transmuted_grade ?? null;
      const q2 = sg.find(g => g.quarter === 2)?.transmuted_grade ?? null;
      const q3 = sg.find(g => g.quarter === 3)?.transmuted_grade ?? null;
      const q4 = sg.find(g => g.quarter === 4)?.transmuted_grade ?? null;
      return { subject: sub, q1, q2, q3, q4, s1: getSemesterFinal(q1, q2), s2: getSemesterFinal(q3, q4), final: getFinalGrade(getSemesterFinal(q1, q2), getSemesterFinal(q3, q4)) };
    });
  };

  const getClassRecord = () => {
    const subj = subjects.find(s => s.id === parseInt(selectedSubject));
    if (!subj) return [];
    return students.map(stu => {
      const sg = grades.filter(g => g.student_id === stu.id && g.subject_id === subj.id);
      const q1 = sg.find(g => g.quarter === 1)?.transmuted_grade ?? null;
      const q2 = sg.find(g => g.quarter === 2)?.transmuted_grade ?? null;
      const q3 = sg.find(g => g.quarter === 3)?.transmuted_grade ?? null;
      const q4 = sg.find(g => g.quarter === 4)?.transmuted_grade ?? null;
      return { student: stu, q1, q2, q3, q4, s1: getSemesterFinal(q1, q2), s2: getSemesterFinal(q3, q4), final: getFinalGrade(getSemesterFinal(q1, q2), getSemesterFinal(q3, q4)) };
    });
  };

  const getAttendanceReport = () => student ? attendance.filter(a => a.student_id === student.id) : [];
  const attendanceRecords = getAttendanceReport();
  const attendanceCounts = {
    present: attendanceRecords.filter(record => record.status === 'Present').length,
    absent: attendanceRecords.filter(record => record.status === 'Absent').length,
    late: attendanceRecords.filter(record => record.status === 'Late').length,
    excused: attendanceRecords.filter(record => record.status === 'Excused').length,
  };
  const attendanceRate = attendanceRecords.length > 0 ? Math.round((attendanceCounts.present / attendanceRecords.length) * 100) : null;

  return (
    <SidebarLayout>
      <div className="page-header no-print">
        <h1>Reports</h1>
        <div className="report-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExcelExport}><FileDown size={16} /> Export Excel</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}><Printer size={16} /> Print</button>
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button className={`btn btn-sm ${activeTab === 'report_card' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('report_card')}><FileText size={14} /> Report Card</button>
        <button className={`btn btn-sm ${activeTab === 'class_record' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('class_record')}><Users size={14} /> Class Record</button>
        <button className={`btn btn-sm ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('attendance')}><ClipboardList size={14} /> Attendance</button>
      </div>

      <div className="no-print" style={{ marginBottom: 20 }}>
        {activeTab === 'report_card' && (
          <div className="form-group" style={{ maxWidth: 320 }}>
            <label>Select Student</label>
            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
              <option value="">-- Select --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.student_code})</option>)}
            </select>
          </div>
        )}
        {activeTab === 'class_record' && (
          <div className="form-group" style={{ maxWidth: 320 }}>
            <label>Select Subject</label>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              <option value="">-- Select --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
          </div>
        )}
        {activeTab === 'attendance' && (
          <div className="form-group" style={{ maxWidth: 320 }}>
            <label>Select Student</label>
            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
              <option value="">-- Select --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.student_code})</option>)}
            </select>
          </div>
        )}
      </div>

      {activeTab === 'report_card' && student && (
        <div ref={reportCardRef} className="report-card">
          <div className="report-card-header">
            <div className="report-school-brand">
              <div className="report-school-logo">
                <GraduationCap className="report-logo-fallback" size={38} color="var(--primary)" />
                <img
                  src="/logo.png"
                  alt="School logo"
                  onLoad={event => event.currentTarget.previousElementSibling?.classList.add('is-hidden')}
                  onError={event => { event.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div>
                <p className="report-republic">Republic of the Philippines</p>
                <h2>Student Management System</h2>
                <p>Senior High School &middot; DepEd Order No. 8, s. 2015</p>
              </div>
            </div>
            <div className="report-card-title">Student Progress Report Card</div>
          </div>
          <div className="report-card-info">
            <div><span>Learner's Name</span><strong>{student.last_name}, {student.first_name}</strong></div>
            <div><span>LRN / Student Code</span><strong>{student.student_code}</strong></div>
            <div><span>Grade Level</span><strong>{student.grade_level}</strong></div>
            <div><span>Section</span><strong>{studentSection?.name ?? 'Not assigned'}</strong></div>
            <div><span>School Year</span><strong>{new Date().getFullYear()} - {new Date().getFullYear() + 1}</strong></div>
            <div><span>Date Issued</span><strong>{new Date().toLocaleDateString()}</strong></div>
          </div>
          <div className="report-section-label">Learner's Academic Performance</div>
          <table className="report-table">
            <thead>
              <tr style={{ borderBottom: '2px solid #1e293b' }}>
                <th className="report-subject-heading">Learning Areas</th>
                <th>Q1</th><th>Q2</th><th>1st Sem</th><th>Q3</th><th>Q4</th><th>2nd Sem</th><th>Final</th><th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {getStudentGrades(student.id).map(row => (
                <tr key={row.subject.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td className="report-subject"><strong>{row.subject.code}</strong><small>{row.subject.name}</small></td>
                  <td style={{ textAlign: 'center' }}>{row.q1 ?? '-'}</td>
                  <td style={{ textAlign: 'center' }}>{row.q2 ?? '-'}</td>
                  <td style={{ textAlign: 'center' }}><strong>{row.s1 ?? '-'}</strong></td>
                  <td style={{ textAlign: 'center' }}>{row.q3 ?? '-'}</td>
                  <td style={{ textAlign: 'center' }}>{row.q4 ?? '-'}</td>
                  <td style={{ textAlign: 'center' }}><strong>{row.s2 ?? '-'}</strong></td>
                  <td style={{ textAlign: 'center' }}><strong>{row.final ?? '-'}</strong></td>
                  <td style={{ textAlign: 'center', color: (row.final ?? 0) >= 75 ? 'green' : 'red', fontWeight: 700 }}>{row.final !== null ? getPassFail(row.final).text : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="report-summary-row">
            <div><span>General Weighted Average</span><strong>{getGWA(getStudentGrades(student.id).map(r => r.final)) ?? '-'}</strong></div>
            <div><span>General Average Remarks</span><strong>{getGWA(getStudentGrades(student.id).map(r => r.final)) !== null ? getPassFail(getGWA(getStudentGrades(student.id).map(r => r.final))!).text : '-'}</strong></div>
          </div>
          <div className="report-section-label">Attendance Record</div>
          <div className="report-attendance-summary">
            {(['Present', 'Absent', 'Late', 'Excused'] as const).map(status => (
              <div key={status}><span>{status}</span><strong>{attendance.filter(record => record.student_id === student.id && record.status === status).length}</strong></div>
            ))}
          </div>
          <p className="report-note">This report card is issued to certify the learner's academic performance and attendance for the school year indicated above.</p>
          <div className="report-signatures">
            <div><strong>Class Adviser</strong><span>Signature over Printed Name</span></div>
            <div><strong>School Principal</strong><span>Signature over Printed Name</span></div>
          </div>
        </div>
      )}

      {activeTab === 'class_record' && (
        <div ref={reportCardRef} className="report-card">
          <div className="report-card-header">
            <h2>Class Record</h2>
            <p>{subjects.find(s => s.id === parseInt(selectedSubject))?.code} &mdash; {subjects.find(s => s.id === parseInt(selectedSubject))?.name}</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e293b' }}>
                <th style={{ textAlign: 'left', padding: 8 }}>Student</th>
                <th>Q1</th><th>Q2</th><th>1st Sem</th><th>Q3</th><th>Q4</th><th>2nd Sem</th><th>Final</th>
              </tr>
            </thead>
            <tbody>
              {getClassRecord().map(row => (
                <tr key={row.student.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td style={{ padding: 8 }}>{row.student.last_name}, {row.student.first_name}</td>
                  <td style={{ textAlign: 'center' }}>{row.q1 ?? '-'}</td>
                  <td style={{ textAlign: 'center' }}>{row.q2 ?? '-'}</td>
                  <td style={{ textAlign: 'center' }}><strong>{row.s1 ?? '-'}</strong></td>
                  <td style={{ textAlign: 'center' }}>{row.q3 ?? '-'}</td>
                  <td style={{ textAlign: 'center' }}>{row.q4 ?? '-'}</td>
                  <td style={{ textAlign: 'center' }}><strong>{row.s2 ?? '-'}</strong></td>
                  <td style={{ textAlign: 'center' }}><strong>{row.final ?? '-'}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'attendance' && student && (
        <div ref={reportCardRef} className="report-card">
          <div className="report-card-header">
            <div className="report-school-brand">
              <div className="report-school-logo">
                <GraduationCap className="report-logo-fallback" size={38} color="var(--primary)" />
                <img src="/logo.png" alt="School logo" onError={event => { event.currentTarget.style.display = 'none'; }} />
              </div>
              <div>
                <p className="report-republic">Republic of the Philippines</p>
                <h2>Student Management System</h2>
                <p>Senior High School &middot; DepEd Order No. 8, s. 2015</p>
              </div>
            </div>
            <div className="report-card-title">Attendance and Absence Report</div>
          </div>
          <div className="report-card-info">
            <div><span>Learner's Name</span><strong>{student.last_name}, {student.first_name}</strong></div>
            <div><span>Student Code</span><strong>{student.student_code}</strong></div>
            <div><span>Grade Level</span><strong>{student.grade_level}</strong></div>
            <div><span>Report Period</span><strong>{new Date().getFullYear()} - {new Date().getFullYear() + 1}</strong></div>
            <div><span>Total Sessions</span><strong>{attendanceRecords.length}</strong></div>
            <div><span>Attendance Rate</span><strong>{attendanceRate === null ? '-' : `${attendanceRate}%`}</strong></div>
          </div>
          <div className="report-section-label">Attendance Overview</div>
          <div className="report-attendance-summary attendance-overview">
            <div className="attendance-present"><span>Present</span><strong>{attendanceCounts.present}</strong></div>
            <div className="attendance-absent"><span>Absent</span><strong>{attendanceCounts.absent}</strong></div>
            <div className="attendance-late"><span>Late</span><strong>{attendanceCounts.late}</strong></div>
            <div className="attendance-excused"><span>Excused</span><strong>{attendanceCounts.excused}</strong></div>
          </div>
          <div className="report-section-label">Daily Attendance Record</div>
          <table className="report-table attendance-table">
            <thead>
              <tr>
                <th>Date</th><th>Session</th><th>Status</th><th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 && <tr><td colSpan={4} className="report-empty">No attendance records found.</td></tr>}
              {attendanceRecords.map(record => (
                <tr key={record.id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.session}</td>
                  <td><strong className={`attendance-status attendance-${record.status.toLowerCase()}`}>{record.status}</strong></td>
                  <td>{record.status === 'Absent' ? 'Absence recorded' : record.status === 'Late' ? 'Late arrival' : record.status === 'Excused' ? 'Excused absence' : 'Attended'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="report-section-label">Absence Details</div>
          <table className="report-table absence-table">
            <thead><tr><th>Date</th><th>Session</th><th>Absence Status</th><th>Action / Remarks</th></tr></thead>
            <tbody>
              {attendanceRecords.filter(record => record.status !== 'Present').length === 0 && <tr><td colSpan={4} className="report-empty">No absences, late arrivals, or excused records.</td></tr>}
              {attendanceRecords.filter(record => record.status !== 'Present').map(record => (
                <tr key={`absence-${record.id}`}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.session}</td>
                  <td><strong className={`attendance-status attendance-${record.status.toLowerCase()}`}>{record.status}</strong></td>
                  <td>{record.status === 'Absent' ? 'For adviser review' : record.status === 'Late' ? 'Monitor attendance' : 'Documentation noted'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="report-note">This report is based on the attendance records encoded in the Student Management System for the period indicated above.</p>
          <div className="report-signatures">
            <div><strong>Class Adviser</strong><span>Signature over Printed Name</span></div>
            <div><strong>School Principal</strong><span>Signature over Printed Name</span></div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
