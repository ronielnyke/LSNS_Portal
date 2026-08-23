import React, { useEffect, useState } from 'react';
import { Clock3, Megaphone, Plus, Trash2, X } from 'lucide-react';
import SidebarLayout from '../components/SidebarLayout';
import { announcementIsForRole, db, addLog, markAnnouncementsRead, notifyAnnouncementsChanged } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import type { Announcement } from '../types';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', audience: 'student' as 'teacher' | 'student' });

  useEffect(() => {
    loadData();
    markAnnouncementsRead(user?.id);
  }, [user?.id]);
  const loadData = () => {
    const all = db.announcements.getAll().filter(announcement => announcementIsForRole(announcement, user?.role));
    const users = db.users.getAll();
    setItems(all.map(a => ({
      ...a,
      posted_by_name: (() => {
        const author = users.find(u => u.id === a.posted_by);
        return author ? `${author.first_name} ${author.last_name}` : 'Unknown';
      })()
    })).reverse());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newItem: Announcement = {
      id: Date.now(),
      title: form.title,
      content: form.content,
      posted_by: user.id,
      audience: form.audience,
      created_at: new Date().toISOString(),
    };
    db.announcements.add(newItem);
    notifyAnnouncementsChanged(newItem.id);
    addLog('Create Announcement', `Posted: ${form.title}`, user.id, `${user.first_name} ${user.last_name}`);
    setModal(false);
    setForm({ title: '', content: '', audience: 'student' });
    loadData();
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete?')) return;
    db.announcements.delete(id);
    addLog('Delete Announcement', `Deleted announcement ID ${id}`, user?.id ?? null, user ? `${user.first_name} ${user.last_name}` : 'System');
    loadData();
  };

  return (
    <SidebarLayout>
      <div className="announcements-page">
        <section className="announcements-hero">
          <div>
            <span className="announcements-kicker">School communications</span>
            <h1>Announcements</h1>
            <p>Stay in the loop with the latest updates from your school community.</p>
          </div>
          <div className="announcements-hero-icon" aria-hidden="true"><Megaphone size={30} /></div>
        </section>

        <div className="announcement-feed-header">
          <div>
            <span>Message center</span>
            <strong>{items.length} {items.length === 1 ? 'message' : 'messages'}</strong>
          </div>
          {user?.role === 'admin' && <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}><Plus size={16} /> New announcement</button>}
        </div>

        <div className="announcement-feed">
        {items.map(item => (
          <article key={item.id} className="announcement-message">
            <div className="announcement-avatar"><Megaphone size={18} /></div>
            <div className="announcement-message-body">
              <div className="announcement-message-topline">
                <div><strong>{item.posted_by_name}</strong><span className="announcement-role">For {item.audience === 'teacher' ? 'Teachers' : item.audience === 'student' ? 'Students' : 'Everyone'}</span></div>
                <time><Clock3 size={13} /> {new Date(item.created_at).toLocaleString()}</time>
              </div>
              <h2>{item.title}</h2>
              <p>{item.content}</p>
              {user?.role === 'admin' && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>}
            </div>
          </article>
        ))}
        {items.length === 0 && <div className="announcement-empty"><Megaphone size={34} /><strong>No announcements yet</strong><span>School updates will appear here when they are posted.</span></div>}
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>New Announcement</h3><button className="close-btn" onClick={() => setModal(false)}><X size={20} /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                <div className="form-group"><label>Content</label><textarea rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} required /></div>
                <div className="form-group"><label>Send announcement to</label><select value={form.audience} onChange={e => setForm({...form, audience: e.target.value as 'teacher' | 'student'})}><option value="student">Students only</option><option value="teacher">Teachers only</option></select></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
