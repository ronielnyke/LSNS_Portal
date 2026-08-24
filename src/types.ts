export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  created_at: string;
  account_status?: 'active' | 'blocked';
  blocked_reason?: string;
}

export interface Student {
  id: number;
  user_id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  section_id: number | null;
  subject_ids?: number[];
  drop_out_overridden?: boolean;
  second_chance_used?: boolean;
  final_ban?: boolean;
  blocked_reason?: string;
  blocked_at?: string;
  attendance_review_from?: string;
  academic_status?: 'regular' | 'repeat_first_semester' | 'permanently_blocked';
  current_semester?: 1 | 2;
  graduation_eligible?: boolean;
  created_at: string;
}

export interface Teacher {
  id: number;
  user_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export type TrackType = 'core' | 'academic_math' | 'academic_research' | 'tvl';

export interface Subject {
  grade_level: any;
  id: number;
  code: string;
  name: string;
  track_type: TrackType;
  description: string;
  created_at: string;
}

export interface Section {
  id: number;
  name: string;
  grade_level: string;
  created_at: string;
}

export interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  quarter: 1 | 2 | 3 | 4;
  ww_score: number;
  ww_total: number;
  pt_score: number;
  pt_total: number;
  qa_score: number;
  qa_total: number;
  initial_grade: number;
  transmuted_grade: number;
  recorded_by: number;
  created_at: string;
}

export interface Attendance {
  id: number;
  student_id: number;
  date: string;
  session: 'AM' | 'PM';
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  recorded_by: number;
  created_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  posted_by: number;
  audience?: 'teacher' | 'student';
  posted_by_name?: string;
  created_at: string;
}

export interface LogEntry {
  id: number;
  action: string;
  details: string;
  user_id: number | null;
  user_name: string;
  ip_address: string;
  created_at: string;
}

export type DBData = {
  users: User[];
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  sections: Section[];
  grades: Grade[];
  attendance: Attendance[];
  announcements: Announcement[];
  logs: LogEntry[];
};

export const MAX_CONSECUTIVE_ABSENCES = 3;