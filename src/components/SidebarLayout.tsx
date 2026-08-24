import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Layers, Settings, GraduationCap,
  LogOut, Menu, X, FileText, ClipboardList, Bell,
  Database, BarChart3, Shield, Printer, HelpCircle, CheckCircle2, Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ANNOUNCEMENTS_CHANGED_EVENT, announcementIsForRole, db, getUnreadAnnouncementCount, markAnnouncementsRead } from '../utils/storage';
import type { Announcement } from '../types';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/teachers', icon: Users, label: 'Teachers' },
  { to: '/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/sections', icon: Layers, label: 'Sections' },
  { to: '/users', icon: Settings, label: 'Users' },
  { to: '/announcements', icon: Bell, label: 'Announcements' },
  { to: '/grades', icon: BarChart3, label: 'Grades' },
  { to: '/attendance', icon: ClipboardList, label: 'Attendance' },
  { to: '/reports', icon: Printer, label: 'Reports' },
  { to: '/logs', icon: Shield, label: 'Audit Logs' },
  { to: '/backup', icon: Database, label: 'Backup / Restore' },
  { to: '/docs', icon: FileText, label: 'Documentation' },
];

const teacherLinks = [
  { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/grades', icon: BarChart3, label: 'Record Grades' },
  { to: '/attendance', icon: ClipboardList, label: 'Attendance' },
  { to: '/announcements', icon: Bell, label: 'Announcements' },
  { to: '/reports', icon: Printer, label: 'Reports' },
  { to: '/docs', icon: FileText, label: 'Documentation' },
];

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/my-grades', icon: BarChart3, label: 'My Grades' },
  { to: '/my-attendance', icon: ClipboardList, label: 'My Attendance' },
  { to: '/announcements', icon: Bell, label: 'Announcements' },
  { to: '/docs', icon: FileText, label: 'Documentation' },
];

function playAnnouncementSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    void audioContext.resume().then(() => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.12);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.42);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.42);
      oscillator.addEventListener('ended', () => { void audioContext.close(); }, { once: true });
    }).catch(() => { void audioContext.close(); });
  } catch { /* notification sound is optional */ }
}

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [announcementToast, setAnnouncementToast] = useState<{ title: string; content: string } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const latestAnnouncementId = useRef<number | null>(null);

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'teacher' ? teacherLinks : studentLinks;

  useEffect(() => {
    const refreshNotifications = () => setUnreadAnnouncements(getUnreadAnnouncementCount(user?.id));
    const showAnnouncementToast = (announcementId: number) => {
      const announcement = db.announcements.getById(announcementId);
      if (!announcement || announcement.posted_by === user?.id || !announcementIsForRole(announcement, user?.role)) return;
      setAnnouncementToast({ title: announcement.title, content: announcement.content });
      playAnnouncementSound();
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setAnnouncementToast(null), 6500);
    };
    const handleAnnouncementChange = (event: Event) => {
      refreshNotifications();
      const announcementId = (event as CustomEvent<{ announcementId?: number }>).detail?.announcementId;
      if (announcementId) {
        latestAnnouncementId.current = announcementId;
        showAnnouncementToast(announcementId);
      }
    };
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== 'sms_db_v1') return;
      refreshNotifications();
      try {
        const announcements = (event.newValue ? JSON.parse(event.newValue).announcements : []) as Announcement[];
        const newest = Array.isArray(announcements)
          ? announcements.filter(announcement => announcementIsForRole(announcement, user?.role)).reduce((latest, announcement) => Math.max(latest, announcement.id), 0)
          : 0;
        if (newest > (latestAnnouncementId.current ?? 0)) {
          latestAnnouncementId.current = newest;
          showAnnouncementToast(newest);
        }
      } catch { /* ignore malformed storage events */ }
    };

    refreshNotifications();
    const existingAnnouncements = db.announcements.getAll();
    latestAnnouncementId.current = existingAnnouncements.reduce((latest, announcement) => Math.max(latest, announcement.id), 0) || null;
    window.addEventListener(ANNOUNCEMENTS_CHANGED_EVENT, handleAnnouncementChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener(ANNOUNCEMENTS_CHANGED_EVENT, handleAnnouncementChange);
      window.removeEventListener('storage', handleStorageChange);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!isLoggingOut) return;

    const logoutTimer = window.setTimeout(() => {
      logout();
      navigate('/login', { replace: true });
    }, 1800);

    return () => window.clearTimeout(logoutTimer);
  }, [isLoggingOut, logout, navigate]);

  const handleLogout = () => setIsLoggingOut(true);
  const handleNavClick = (path: string) => {
    if (path === '/announcements') {
      markAnnouncementsRead(user?.id);
      setUnreadAnnouncements(0);
      setAnnouncementToast(null);
    }
    setMobileOpen(false);
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo brand-logo-sidebar">
            <GraduationCap className="brand-logo-fallback" size={28} />
            <img
              className="brand-logo-image"
              src="/logo.png"
              alt="School logo"
              onLoad={(event) => event.currentTarget.previousElementSibling?.classList.add('is-hidden')}
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
          </div>
          <span>SMS</span>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(link.to)}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
              {link.to === '/announcements' && unreadAnnouncements > 0 && (
                <span className="announcement-notification-badge" aria-label={`${unreadAnnouncements} unread announcements`}>
                  {unreadAnnouncements > 99 ? '99+' : unreadAnnouncements}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{user?.first_name} {user?.last_name}</strong>
            <small>{user?.role}</small>
          </div>
          <button className="logout-btn" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu size={22} />
          </button>
          <h2 key={location.pathname} className="page-title">
            {links.find(l => l.to === location.pathname)?.label || 'Dashboard'}
          </h2>
        </header>
        <main key={location.pathname} className="content-body">{children}</main>
      </div>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
      {announcementToast && (
        <div className="announcement-toast" role="status" aria-live="polite">
          <button
            className="announcement-toast-main"
            onClick={() => {
              markAnnouncementsRead(user?.id);
              setUnreadAnnouncements(0);
              setAnnouncementToast(null);
              navigate('/announcements');
            }}
          >
            <span className="announcement-toast-icon"><Bell size={19} /></span>
            <span className="announcement-toast-copy">
              <strong>New announcement</strong>
              <span>{announcementToast.title}</span>
              <small>{announcementToast.content}</small>
            </span>
          </button>
          <button className="announcement-toast-close" onClick={() => setAnnouncementToast(null)} aria-label="Close notification">
            <X size={16} />
          </button>
        </div>
      )}
      {isLoggingOut && (
        <div className="logout-screen" role="status" aria-live="polite">
          <div className="logout-orbit logout-orbit-one" aria-hidden="true" />
          <div className="logout-orbit logout-orbit-two" aria-hidden="true" />
          <div className="logout-content">
            <div className="logout-icon-wrap">
              <CheckCircle2 className="logout-check" size={44} strokeWidth={1.8} />
              <Sparkles className="logout-sparkle logout-sparkle-one" size={18} aria-hidden="true" />
              <Sparkles className="logout-sparkle logout-sparkle-two" size={14} aria-hidden="true" />
            </div>
            <p className="logout-eyebrow">Session complete</p>
            <h1>Thank you, {user?.first_name} {user?.last_name}!</h1>
            <p className="logout-message">Thank you for using</p>
            <p className="logout-system-name">Student Management System</p>
            <div className="logout-progress" aria-hidden="true"><span /></div>
            <p className="logout-status">Signing you out securely<span className="loading-dots">...</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
