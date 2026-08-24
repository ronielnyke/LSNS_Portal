import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { db, getRoleData, isStudentDroppedOut } from '../utils/storage';
import type { Student, Attendance } from '../types';

export default function StudentAttendance() {
  const roleData = getRoleData() as Student | null;
  const [records, setRecords] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!roleData) return;
    const all = db.attendance.getAll().filter(a => a.student_id === roleData.id);
    setRecords(all);

    const total = all.length;
    const present = all.filter(a => a.status === 'Present').length;
    const late = all.filter(a => a.status === 'Late').length;
    const excused = all.filter(a => a.status === 'Excused').length;
    const absent = all.filter(a => a.status === 'Absent').length;

    const absentDates = [...new Set(all.filter(a => a.status === 'Absent').map(a => a.date))].sort();
    let maxConsecutive = 0, current = 0, prev: Date | null = null;
    for (const d of absentDates) {
      const curr = new Date(d);
      if (prev && (curr.getTime() - prev.getTime()) === 86400000) current++;
      else { maxConsecutive = Math.max(maxConsecutive, current); current = 1; }
      prev = curr;
    }
    maxConsecutive = Math.max(maxConsecutive, current);

    const rate = total > 0 ? Math.round(((present + late + excused) / total) * 100) : 0;
    const status = isStudentDroppedOut(roleData) ? 'Drop' : rate >= 75 ? 'Good' : rate > 0 ? 'Warning' : 'Good';

    setStats({ total_sessions: total, present, late, excused, absent, rate, status, consecutive_absences: maxConsecutive });
  }, [roleData]);

  if (!roleData) return <SidebarLayout><div className="alert alert-danger">Student data not found.</div></SidebarLayout>;

  const displayRate = stats?.status === 'Drop' ? 0 : stats?.rate ?? 0;

  return (
    <SidebarLayout>
      <div className="page-header"><h1>My Attendance</h1></div>

      {stats?.status === 'Drop' && (
        <div className="drop-warning">
          <h2><XCircle size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> DROP OUT WARNING</h2>
          <p>You have 3 or more consecutive absences. Your attendance rate is 0%.</p>
        </div>
      )}

      {stats && (
        <>
          <section className="attendance-command-center" aria-label="My attendance overview">
            <div className="attendance-overview-copy">
              <span className="attendance-kicker">Personal attendance intelligence</span>
              <h2>{displayRate}% Attendance Rate</h2>
              <p>{stats.total_sessions} attendance sessions are recorded in your student profile.</p>
              <div className="attendance-progress-track" aria-label={`${displayRate}% attendance rate`}>
                <span className="attendance-progress-fill" style={{ width: `${displayRate}%` }} />
              </div>
              <small>{stats.consecutive_absences ? `${stats.consecutive_absences} consecutive absence${stats.consecutive_absences === 1 ? '' : 's'} recorded` : 'No consecutive absences recorded'}</small>
            </div>
            <div className="attendance-gauge" style={{ '--gauge-progress': `${displayRate * 3.6}deg` } as React.CSSProperties}>
              <div className="attendance-gauge-inner"><strong>{displayRate}%</strong><span>attendance</span></div>
            </div>
          </section>
          <div className="attendance-stats-grid">
            <div className="attendance-stat attendance-stat-present"><span>Present</span><strong>{stats.present}</strong><small>Sessions attended</small></div>
            <div className="attendance-stat attendance-stat-absent"><span>Absent</span><strong>{stats.absent}</strong><small>Review required</small></div>
            <div className="attendance-stat attendance-stat-late"><span>Late</span><strong>{stats.late}</strong><small>Late arrivals</small></div>
            <div className="attendance-stat attendance-stat-excused"><span>Excused</span><strong>{stats.excused}</strong><small>Approved records</small></div>
          </div>
        </>
      )}

      <div className="card">
        <div className="card-header"><div><h2>My Daily Attendance</h2><small className="attendance-readonly-label">View-only student record</small></div></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Session</th><th>Status</th></tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}><td>{r.date}</td><td>{r.session}</td><td className={`status-${r.status.toLowerCase()}`}>{r.status}</td></tr>
              ))}
              {records.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 40 }}>No attendance records</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}