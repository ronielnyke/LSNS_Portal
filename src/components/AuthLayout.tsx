import React from 'react';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand-logo brand-logo-auth">
            <GraduationCap className="brand-logo-fallback" size={48} color="var(--primary)" />
            <img
              className="brand-logo-image"
              src="/logo.png"
              alt="School logo"
              onLoad={(event) => event.currentTarget.previousElementSibling?.classList.add('is-hidden')}
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h1>Student Management System</h1>
          <p>DepEd Order No. 8, s. 2015 Compliant</p>
          <div className="auth-security-badge" aria-label="Secure access enabled">
            <span className="auth-security-pulse" aria-hidden="true" />
            <ShieldCheck size={14} />
            <span>Secure access</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
