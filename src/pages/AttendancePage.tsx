import React, { useEffect, useState } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { db, addLog, enforceStudentAttendanceBlock } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import type { Student, Attendance } from '../types';

export default function AttendancePage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => { loadStudents(); }, []);
  useEffect(() => { loadAttendance(); }, [date]);

  const loadStudents = () => setStudents(db.students.getAll());
  const loadAttendance = () => setAttendance(db.attendance.getAll().filter(a => a.date === date));

  const getStatus = (studentId: number, session: 'AM' | 'PM') => {
    const rec = attendance.find(a => a.student_id === studentId && a.session === session);
    return rec ? rec.status : '';
  };

  const handleChange = (studentId: number, session: 'AM' | 'PM', status: string) => {
    if (!status || !user) return;
    const existing = attendance.find(a => a.student_id === studentId && a.date === date && a.session === session);
    if (existing) { alert('Attendance already recorded for this session. Cannot change.'); return; }
    setSaving(studentId);
    const newRec: Attendance = {
      id: Date.now(),
      student_id: studentId,
      date,
      session,
      status: status as 'Present' | 'Absent' | 'Late' | 'Excused',
      recorded_by: user.id,
      created_at: new Date().toISOString(),
    };
    db.attendance.add(newRec);
    if (status === 'Absent') enforceStudentAttendanceBlock(studentId);
    addLog('Record Attendance', `${status} for student ${studentId} on ${date} ${session}`, user.id, `${user.first_name} ${user.last_name}`);
    setSaving(null);
    loadAttendance();
  };

  const statusOptions = ['Present', 'Absent', 'Late', 'Excused'];

  return (
    <SidebarLayout>
      <div className="page-header attendance-record-header">
        <h1>Record Attendance</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px 14px', borderRadius: 8, border: '2px solid var(--border)', fontFamily: 'inherit' }} />
      </div>
      <div className="card attendance-record-card">
        <div className="table-container">
          <table>
            <thead><tr><th>#</th><th>Student</th><th>Grade</th><th>AM Session</th><th>PM Session</th></tr></thead>
            <tbody>
              {students.map((s, idx) => (
                <tr className="attendance-record-row" key={s.id} style={{ opacity: saving === s.id ? 0.6 : 1 }}>
                  <td>{idx + 1}</td>
                  <td><strong>{s.first_name} {s.last_name}</strong><br/><small style={{ color: 'var(--text-light)' }}>{s.student_code}</small></td>
                  <td>{s.grade_level || '-'}</td>
                  <td>
                    <select className="attendance-select" value={getStatus(s.id, 'AM')} onChange={e => handleChange(s.id, 'AM', e.target.value)} disabled={!!getStatus(s.id, 'AM')}>
                      <option value="">-</option>
                      {statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="attendance-select" value={getStatus(s.id, 'PM')} onChange={e => handleChange(s.id, 'PM', e.target.value)} disabled={!!getStatus(s.id, 'PM')}>
                      <option value="">-</option>
                      {statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {students.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 40 }}>No students registered yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}
