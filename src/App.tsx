import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import SubjectsPage from './pages/SubjectsPage';
import SectionsPage from './pages/SectionsPage';
import UsersPage from './pages/UsersPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import GradesPage from './pages/GradesPage';
import StudentGrades from './pages/StudentGrades';
import AttendancePage from './pages/AttendancePage';
import StudentAttendance from './pages/StudentAttendance';
import LogsPage from './pages/LogsPage';
import BackupRestorePage from './pages/BackupRestorePage';
import ReportsPage from './pages/ReportsPage';
import DocumentationPage from './pages/DocumentationPage';

function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-content">
        <div className="loading-logo brand-logo">
          <span className="loading-ring" aria-hidden="true" />
          <GraduationCap className="brand-logo-fallback" size={52} color="var(--primary)" />
          <img
            className="brand-logo-image"
            src="/logo.jpg"
            alt="School logo"
            onLoad={(event) => event.currentTarget.previousElementSibling?.classList.add('is-hidden')}
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
        </div>
        <p className="loading-eyebrow">Welcome to</p>
        <h1>Student Management System</h1>
        <p className="loading-status">Preparing your dashboard<span className="loading-dots" aria-hidden="true">...</span></p>
        <div className="loading-progress" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user } = useAuth();

  const getHome = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    return <Navigate to="/student" replace />;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={getHome()} />

      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />

      <Route path="/students" element={<ProtectedRoute allowedRoles={['admin']}><StudentsPage /></ProtectedRoute>} />
      <Route path="/teachers" element={<ProtectedRoute allowedRoles={['admin']}><TeachersPage /></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute allowedRoles={['admin']}><SubjectsPage /></ProtectedRoute>} />
      <Route path="/sections" element={<ProtectedRoute allowedRoles={['admin']}><SectionsPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />

      <Route path="/announcements" element={<ProtectedRoute allowedRoles={['admin','teacher','student']}><AnnouncementsPage /></ProtectedRoute>} />
      <Route path="/grades" element={<ProtectedRoute allowedRoles={['admin','teacher']}><GradesPage /></ProtectedRoute>} />
      <Route path="/my-grades" element={<ProtectedRoute allowedRoles={['student']}><StudentGrades /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin','teacher']}><AttendancePage /></ProtectedRoute>} />
      <Route path="/my-attendance" element={<ProtectedRoute allowedRoles={['student']}><StudentAttendance /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin','teacher']}><ReportsPage /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute allowedRoles={['admin']}><LogsPage /></ProtectedRoute>} />
      <Route path="/backup" element={<ProtectedRoute allowedRoles={['admin']}><BackupRestorePage /></ProtectedRoute>} />
      <Route path="/docs" element={<ProtectedRoute allowedRoles={['admin','teacher','student']}><DocumentationPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
