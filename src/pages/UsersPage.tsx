import React, { useEffect, useState } from 'react';
import { ShieldCheck, Trash2 } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { db, addLog, enforceStudentAttendanceBlock, grantStudentSecondChance, getMaxConsecutiveAbsences } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => { loadData(); }, []);
  const loadData = () => {
    db.students.getAll().forEach(student => enforceStudentAttendanceBlock(student.id));
    setUsers(db.users.getAll());
  };

  const handleDelete = (id: number) => {
    if (id === user?.id) { alert('Cannot delete yourself.'); return; }
    if (!confirm('Delete this user?')) return;
    db.users.delete(id);
    addLog('Delete User', `Deleted user ID ${id}`, user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
    loadData();
  };

  const handleSecondChance = (accountId: number) => {
    const student = db.students.getAll().find(item => item.user_id === accountId);
    if (!student || !user) return;
    if (!confirm('Unblock this student and grant a second chance? Attendance history will remain unchanged.')) return;
    grantStudentSecondChance(student.id, user.id);
    loadData();
  };

  return (
    <SidebarLayout>
      <div className="page-header"><h1>Users</h1></div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>{u.account_status === 'blocked' ? <span className="account-status-blocked">{u.role === 'student' && db.students.getAll().find(student => student.user_id === u.id)?.second_chance_used ? 'Permanent block' : 'Blocked'}</span> : <span className="account-status-active">Active</span>}{u.role === 'student' && u.account_status === 'blocked' && <small className="account-status-reason">{u.blocked_reason || `${getMaxConsecutiveAbsences(db.students.getAll().find(student => student.user_id === u.id)?.id ?? 0)} consecutive absences`}</small>}</td>
                  <td>
                    {u.role === 'student' && u.account_status === 'blocked' && !db.students.getAll().find(student => student.user_id === u.id)?.second_chance_used && <button className="btn btn-sm btn-primary" onClick={() => handleSecondChance(u.id)}><ShieldCheck size={14} /> Second chance</button>}
                    {u.id !== user?.id && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}><Trash2 size={14} /></button>}
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 40 }}>No users</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}