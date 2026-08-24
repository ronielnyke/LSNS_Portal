import type { User, Student, Teacher, Subject, Section, Grade, Attendance, Announcement, LogEntry, DBData } from '../types';
import { hashPassword, getClientIP } from './security';

const STORAGE_KEY = 'sms_db_v1';
const ANNOUNCEMENT_READS_KEY = 'sms_announcement_reads_v1';
export const ANNOUNCEMENTS_CHANGED_EVENT = 'sms-announcements-changed';

export function announcementIsForRole(announcement: Announcement, role: User['role'] | undefined): boolean {
  return role === 'admin' || !announcement.audience || announcement.audience === role;
}

export function getSubjectsForStudent(student: Student, subjects: Subject[]): Subject[] {
  if (!Array.isArray(student.subject_ids)) return subjects;
  const assigned = new Set(student.subject_ids);
  return subjects.filter(subject => assigned.has(subject.id));
}

export function getMaxConsecutiveAbsences(studentId: number): number {
  const student = db.students.getById(studentId);
  const reviewFrom = student?.attendance_review_from;
  const absentDates = [...new Set(db.attendance.getAll().filter(record => record.student_id === studentId && record.status === 'Absent' && (!reviewFrom || record.date >= reviewFrom)).map(record => record.date))].sort();
  let max = 0;
  let current = 0;
  let previous: Date | null = null;
  for (const date of absentDates) {
    const currentDate = new Date(date);
    const diffDays = previous ? Math.round((currentDate.getTime() - previous.getTime()) / 86400000) : 0;
    current = previous && diffDays === 1 ? current + 1 : 1;
    max = Math.max(max, current);
    previous = currentDate;
  }
  return max;
}

export function isStudentDroppedOut(student: Student): boolean {
  return getMaxConsecutiveAbsences(student.id) >= 3;
}

export function enforceStudentAttendanceBlock(studentId: number): void {
  const student = db.students.getById(studentId);
  if (!student || getMaxConsecutiveAbsences(studentId) < 3) return;
  const permanent = student.second_chance_used === true;

  const account = db.users.getById(student.user_id);
  if (account?.account_status === 'blocked' && !permanent) return;

  db.users.update(student.user_id, user => ({ ...user, account_status: 'blocked', blocked_reason: permanent ? 'Permanent block: attendance drop-out repeated after second chance.' : 'Automatic attendance drop-out: 3 consecutive absences.' }));
  if (permanent) db.students.update(studentId, current => ({ ...current, drop_out_overridden: false, academic_status: 'permanently_blocked', current_semester: 1, graduation_eligible: false }));
}

export function grantStudentSecondChance(studentId: number, adminId: number): boolean {
  const student = db.students.getById(studentId);
  if (!student || student.second_chance_used) return false;
  db.students.update(studentId, current => ({ ...current, drop_out_overridden: true, second_chance_used: true, attendance_review_from: new Date().toISOString().split('T')[0] }));
  db.users.update(student.user_id, current => ({ ...current, account_status: 'active', blocked_reason: undefined }));
  addLog('Grant Student Second Chance', `Unblocked student ${studentId} after attendance drop-out`, adminId, 'Administrator');
  return true;
}

function loadDB(): DBData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return getDefaultDB();
}

function saveDB(data: DBData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDefaultDB(): DBData {
  const adminUser: User = {
    id: 1,
    email: 'admin@school.edu',
    password_hash: hashPassword('admin123'),
    role: 'admin',
    first_name: 'System',
    last_name: 'Administrator',
    created_at: new Date().toISOString(),
  };
  return {
    users: [adminUser],
    students: [],
    teachers: [],
    subjects: [],
    sections: [],
    grades: [],
    attendance: [],
    announcements: [],
    logs: [],
  };
}

// Users table
const usersTable = {
  getAll: (): User[] => loadDB().users,
  getById: (id: number): User | undefined => loadDB().users.find(x => x.id === id),
  add: (item: User): void => { const data = loadDB(); data.users.push(item); saveDB(data); },
  update: (id: number, updater: (item: User) => User): void => {
    const data = loadDB(); const idx = data.users.findIndex(x => x.id === id);
    if (idx !== -1) { data.users[idx] = updater(data.users[idx]); saveDB(data); }
  },
  delete: (id: number): void => { const data = loadDB(); data.users = data.users.filter(x => x.id !== id); saveDB(data); },
  setAll: (items: User[]): void => { const data = loadDB(); data.users = items; saveDB(data); },
};

// Students table
const studentsTable = {
  getAll: (): Student[] => loadDB().students,
  getById: (id: number): Student | undefined => loadDB().students.find(x => x.id === id),
  add: (item: Student): void => { const data = loadDB(); data.students.push(item); saveDB(data); },
  update: (id: number, updater: (item: Student) => Student): void => {
    const data = loadDB(); const idx = data.students.findIndex(x => x.id === id);
    if (idx !== -1) { data.students[idx] = updater(data.students[idx]); saveDB(data); }
  },
  delete: (id: number): void => { const data = loadDB(); data.students = data.students.filter(x => x.id !== id); saveDB(data); },
  setAll: (items: Student[]): void => { const data = loadDB(); data.students = items; saveDB(data); },
};

// Teachers table
const teachersTable = {
  getAll: (): Teacher[] => loadDB().teachers,
  getById: (id: number): Teacher | undefined => loadDB().teachers.find(x => x.id === id),
  add: (item: Teacher): void => { const data = loadDB(); data.teachers.push(item); saveDB(data); },
  update: (id: number, updater: (item: Teacher) => Teacher): void => {
    const data = loadDB(); const idx = data.teachers.findIndex(x => x.id === id);
    if (idx !== -1) { data.teachers[idx] = updater(data.teachers[idx]); saveDB(data); }
  },
  delete: (id: number): void => { const data = loadDB(); data.teachers = data.teachers.filter(x => x.id !== id); saveDB(data); },
  setAll: (items: Teacher[]): void => { const data = loadDB(); data.teachers = items; saveDB(data); },
};

// Subjects table
const subjectsTable = {
  getAll: (): Subject[] => loadDB().subjects,
  getById: (id: number): Subject | undefined => loadDB().subjects.find(x => x.id === id),
  add: (item: Subject): void => { const data = loadDB(); data.subjects.push(item); saveDB(data); },
  update: (id: number, updater: (item: Subject) => Subject): void => {
    const data = loadDB(); const idx = data.subjects.findIndex(x => x.id === id);
    if (idx !== -1) { data.subjects[idx] = updater(data.subjects[idx]); saveDB(data); }
  },
  delete: (id: number): void => { const data = loadDB(); data.subjects = data.subjects.filter(x => x.id !== id); saveDB(data); },
  setAll: (items: Subject[]): void => { const data = loadDB(); data.subjects = items; saveDB(data); },
};

// Sections table
const sectionsTable = {
  getAll: (): Section[] => loadDB().sections,
  getById: (id: number): Section | undefined => loadDB().sections.find(x => x.id === id),
  add: (item: Section): void => { const data = loadDB(); data.sections.push(item); saveDB(data); },
  update: (id: number, updater: (item: Section) => Section): void => {
    const data = loadDB(); const idx = data.sections.findIndex(x => x.id === id);
    if (idx !== -1) { data.sections[idx] = updater(data.sections[idx]); saveDB(data); }
  },
  delete: (id: number): void => { const data = loadDB(); data.sections = data.sections.filter(x => x.id !== id); saveDB(data); },
  setAll: (items: Section[]): void => { const data = loadDB(); data.sections = items; saveDB(data); },
};

// Grades table
const gradesTable = {
  getAll: (): Grade[] => loadDB().grades,
  getById: (id: number): Grade | undefined => loadDB().grades.find(x => x.id === id),
  add: (item: Grade): void => { const data = loadDB(); data.grades.push(item); saveDB(data); },
  update: (id: number, updater: (item: Grade) => Grade): void => {
    const data = loadDB(); const idx = data.grades.findIndex(x => x.id === id);
    if (idx !== -1) { data.grades[idx] = updater(data.grades[idx]); saveDB(data); }
  },
  delete: (id: number): void => { const data = loadDB(); data.grades = data.grades.filter(x => x.id !== id); saveDB(data); },
  setAll: (items: Grade[]): void => { const data = loadDB(); data.grades = items; saveDB(data); },
};

// Attendance table
const attendanceTable = {
  getAll: (): Attendance[] => loadDB().attendance,
  getById: (id: number): Attendance | undefined => loadDB().attendance.find(x => x.id === id),
  add: (item: Attendance): void => { const data = loadDB(); data.attendance.push(item); saveDB(data); },
  update: (id: number, updater: (item: Attendance) => Attendance): void => {
    const data = loadDB(); const idx = data.attendance.findIndex(x => x.id === id);
    if (idx !== -1) { data.attendance[idx] = updater(data.attendance[idx]); saveDB(data); }
  },
  delete: (id: number): void => { const data = loadDB(); data.attendance = data.attendance.filter(x => x.id !== id); saveDB(data); },
  setAll: (items: Attendance[]): void => { const data = loadDB(); data.attendance = items; saveDB(data); },
};

// Announcements table
const announcementsTable = {
  getAll: (): Announcement[] => loadDB().announcements,
  getById: (id: number): Announcement | undefined => loadDB().announcements.find(x => x.id === id),
  add: (item: Announcement): void => { const data = loadDB(); data.announcements.push(item); saveDB(data); },
  update: (id: number, updater: (item: Announcement) => Announcement): void => {
    const data = loadDB(); const idx = data.announcements.findIndex(x => x.id === id);
    if (idx !== -1) { data.announcements[idx] = updater(data.announcements[idx]); saveDB(data); }
  },
  delete: (id: number): void => { const data = loadDB(); data.announcements = data.announcements.filter(x => x.id !== id); saveDB(data); },
  setAll: (items: Announcement[]): void => { const data = loadDB(); data.announcements = items; saveDB(data); },
};

// Logs table
const logsTable = {
  getAll: (): LogEntry[] => loadDB().logs,
  getById: (id: number): LogEntry | undefined => loadDB().logs.find(x => x.id === id),
  add: (item: LogEntry): void => { const data = loadDB(); data.logs.push(item); saveDB(data); },
  update: (id: number, updater: (item: LogEntry) => LogEntry): void => {
    const data = loadDB(); const idx = data.logs.findIndex(x => x.id === id);
    if (idx !== -1) { data.logs[idx] = updater(data.logs[idx]); saveDB(data); }
  },
  delete: (id: number): void => { const data = loadDB(); data.logs = data.logs.filter(x => x.id !== id); saveDB(data); },
  setAll: (items: LogEntry[]): void => { const data = loadDB(); data.logs = items; saveDB(data); },
};

export const db = {
  users: usersTable,
  students: studentsTable,
  teachers: teachersTable,
  subjects: subjectsTable,
  sections: sectionsTable,
  grades: gradesTable,
  attendance: attendanceTable,
  announcements: announcementsTable,
  logs: logsTable,
};

function loadAnnouncementReads(): Record<string, number[]> {
  try {
    const raw = localStorage.getItem(ANNOUNCEMENT_READS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

export function getUnreadAnnouncementCount(userId: number | null | undefined): number {
  if (!userId) return 0;
  const user = db.users.getById(userId);
  if (!user) return 0;
  const readIds = new Set(loadAnnouncementReads()[String(userId)] || []);
  return db.announcements.getAll().filter(announcement => announcementIsForRole(announcement, user.role) && announcement.posted_by !== userId && !readIds.has(announcement.id)).length;
}

export function markAnnouncementsRead(userId: number | null | undefined): void {
  if (!userId) return;
  const reads = loadAnnouncementReads();
  reads[String(userId)] = db.announcements.getAll().map(announcement => announcement.id);
  localStorage.setItem(ANNOUNCEMENT_READS_KEY, JSON.stringify(reads));
}

export function notifyAnnouncementsChanged(announcementId?: number): void {
  window.dispatchEvent(new CustomEvent(ANNOUNCEMENTS_CHANGED_EVENT, { detail: { announcementId } }));
}

export function addLog(
  action: string,
  details: string,
  userId: number | null = null,
  userName: string = 'System'
): void {
  const entry: LogEntry = {
    id: Date.now(),
    action,
    details,
    user_id: userId,
    user_name: userName,
    ip_address: getClientIP(),
    created_at: new Date().toISOString(),
  };
  db.logs.add(entry);
}

export function exportDatabase(): string {
  return JSON.stringify(loadDB(), null, 2);
}

export function importDatabase(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data && typeof data === 'object' && Array.isArray(data.users)) {
      saveDB(data as DBData);
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

export function getRoleData(): Student | Teacher | null {
  const auth = sessionStorage.getItem('sms_auth') || localStorage.getItem('sms_auth');
  if (!auth) return null;
  try {
    const { userId, role } = JSON.parse(auth);
    const normalizedUserId = Number(userId);
    if (!Number.isFinite(normalizedUserId)) return null;
    if (role === 'student') {
      return db.students.getAll().find(s => s.user_id === normalizedUserId) || null;
    }
    if (role === 'teacher') {
      return db.teachers.getAll().find(t => t.user_id === normalizedUserId) || null;
    }
  } catch { /* ignore */ }
  return null;
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('sms_auth');
};