import React, { useState } from 'react';
import { Trash2, Download, Search } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { db } from '../utils/storage';
import type { LogEntry } from '../types';

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>(() => db.logs.getAll().reverse());
  const [search, setSearch] = useState('');

  const handleClear = () => {
    if (!confirm('Clear all logs?')) return;
    db.logs.setAll([]);
    setLogs([]);
  };

  const handleExport = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    l.user_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="page-header">
        <h1>Audit Logs</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export</button>
          <button className="btn btn-danger btn-sm" onClick={handleClear}><Trash2 size={14} /> Clear</button>
        </div>
      </div>
      <div className="form-group" style={{ maxWidth: 320, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
      </div>
      <div className="card">
        {filtered.map(log => (
          <div key={log.id} className="log-entry">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: 'var(--primary)' }}>{log.action}</strong>
              <span className="log-time">{new Date(log.created_at).toLocaleString()}</span>
            </div>
            <p style={{ marginTop: 4 }}>{log.details}</p>
            <small style={{ color: 'var(--text-light)' }}>By: {log.user_name} | IP: {log.ip_address}</small>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>No logs found</div>}
      </div>
    </SidebarLayout>
  );
}
