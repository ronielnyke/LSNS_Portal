import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Layers, BarChart3, ClipboardList, Bell, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { db } from '../utils/storage';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, subjects: 0, sections: 0, grades: 0, attendance: 0, announcements: 0 });

  useEffect(() => {
    setStats({
      students: db.students.getAll().length,
      teachers: db.teachers.getAll().length,
      subjects: db.subjects.getAll().length,
      sections: db.sections.getAll().length,
      grades: db.grades.getAll().length,
      attendance: db.attendance.getAll().length,
      announcements: db.announcements.getAll().length,
    });
  }, []);

  const cards = [
    { label: 'Students', value: stats.students, icon: Users, color: '#2563eb', to: '/students' },
    { label: 'Teachers', value: stats.teachers, icon: Users, color: '#7c3aed', to: '/teachers' },
    { label: 'Subjects', value: stats.subjects, icon: BookOpen, color: '#059669', to: '/subjects' },
    { label: 'Sections', value: stats.sections, icon: Layers, color: '#d97706', to: '/sections' },
    { label: 'Grades Recorded', value: stats.grades, icon: BarChart3, color: '#dc2626', to: '/grades' },
    { label: 'Attendance Logs', value: stats.attendance, icon: ClipboardList, color: '#0891b2', to: '/attendance' },
    { label: 'Announcements', value: stats.announcements, icon: Bell, color: '#be185d', to: '/announcements' },
  ];

  return (
    <SidebarLayout>
      <section className="admin-hero">
        <div>
          <span className="admin-dashboard-kicker">System command center</span>
          <h1>Admin Dashboard</h1>
          <p>Manage learners, academic records, attendance, and school operations from one secure workspace.</p>
        </div>
        <div className="admin-hero-signal"><span className="admin-signal-dot" />System operational</div>
      </section>
      <div className="stats-grid admin-dashboard-grid" style={{gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))'}}>
        {cards.map(c => (
          <Link className="admin-dashboard-link" key={c.label} to={c.to}>
            <div className="stat-card admin-stat-card" style={{borderTop:`4px solid ${c.color}`}}>
              <c.icon size={24} style={{color:c.color,marginBottom:8}} />
              <h3>{c.label}</h3>
              <div className="value" style={{color:c.color}}>{c.value}</div>
              <ArrowUpRight className="admin-card-arrow" size={16} />
            </div>
          </Link>
        ))}
      </div>
    </SidebarLayout>
  );
}
