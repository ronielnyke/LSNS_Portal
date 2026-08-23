import React, { useState } from 'react';
import { Download, Upload, Database } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { exportDatabase, importDatabase, addLog } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';

export default function BackupRestorePage() {
  const { user } = useAuth();
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');

  const handleExport = () => {
    const data = exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sms_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('Database Export', 'Admin exported database backup.', user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
    setMessage('Database exported successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImport = () => {
    if (!importText.trim()) { setMessage('Paste JSON data first.'); return; }
    if (!confirm('This will OVERWRITE all current data. Continue?')) return;
    const success = importDatabase(importText);
    if (success) {
      addLog('Database Import', 'Admin imported database backup.', user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
      setMessage('Database imported successfully! Refreshing...');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setMessage('Invalid JSON format.');
    }
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <SidebarLayout>
      <div className="page-header"><h1>Backup / Restore</h1></div>
      {message && <div className={`alert alert-${message.includes('success') ? 'success' : 'warning'}`}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header"><h2><Download size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> Export Database</h2></div>
          <div className="card-body">
            <p style={{ marginBottom: 16, color: 'var(--text-light)' }}>Download a complete backup of all system data as JSON.</p>
            <button className="btn btn-primary" onClick={handleExport}><Download size={16} /> Download Backup</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2><Upload size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> Import Database</h2></div>
          <div className="card-body">
            <p style={{ marginBottom: 16, color: 'var(--text-light)' }}>Paste previously exported JSON to restore all data.</p>
            <div className="form-group">
              <textarea rows={8} value={importText} onChange={e => setImportText(e.target.value)} placeholder="Paste JSON here..." />
            </div>
            <button className="btn btn-success" onClick={handleImport}><Upload size={16} /> Restore Backup</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h2><Database size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> What is Backed Up?</h2></div>
        <div className="card-body">
          <ul style={{ marginLeft: 20, lineHeight: 1.8 }}>
            <li>All Users (Admin, Teachers, Students)</li>
            <li>Students &amp; Teachers records</li>
            <li>Subjects &amp; Sections</li>
            <li>All Grades (Q1-Q4, Initial &amp; Transmuted)</li>
            <li>Attendance Records</li>
            <li>Announcements</li>
            <li>Audit Logs</li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  );
}
