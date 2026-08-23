import React, { useEffect, useState } from 'react';
import { Users, BarChart3, ClipboardList, Bell, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { announcementIsForRole, db } from '../utils/storage';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ students: 0, grades: 0, attendance: 0, announcements: 0 });

  useEffect(() => {
    setStats({
      students: db.students.getAll().length,
      grades: db.grades.getAll().length,
      attendance: db.attendance.getAll().length,
      announcements: db.announcements.getAll().filter(announcement => announcementIsForRole(announcement, 'teacher')).length,
    });
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: '#2563eb', to: '/grades' },
    { label: 'Grades Recorded', value: stats.grades, icon: BarChart3, color: '#059669', to: '/grades' },
    { label: 'Attendance Logs', value: stats.attendance, icon: ClipboardList, color: '#d97706', to: '/attendance' },
    { label: 'Announcements', value: stats.announcements, icon: Bell, color: '#be185d', to: '/announcements' },
  ];

  return (
    <SidebarLayout>
      <section className="teacher-hero">
        <div>
          <span className="teacher-dashboard-kicker">Teaching workspace</span>
          <h1>Teacher Dashboard</h1>
          <p>Monitor your classes, update academic records, and keep students informed.</p>
        </div>
        <div className="teacher-hero-signal"><span className="teacher-signal-dot" />Workspace active</div>
      </section>
      <div className="stats-grid teacher-dashboard-grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))'}}>
        {cards.map(c => (
          <Link className="teacher-dashboard-link" key={c.label} to={c.to}>
            <div className="stat-card teacher-stat-card" style={{borderTop:`4px solid ${c.color}`}}>
              <c.icon size={24} style={{color:c.color,marginBottom:8}} />
              <h3>{c.label}</h3>
              <div className="value" style={{color:c.color}}>{c.value}</div>
              <ArrowUpRight className="teacher-card-arrow" size={16} />
            </div>
          </Link>
        ))}
      </div>
    </SidebarLayout>
  );
}
