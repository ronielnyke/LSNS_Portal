import type { Grade, TrackType } from '../types';

export const TRACK_WEIGHTS: Record<TrackType, { ww: number; pt: number; qa: number; label: string }> = {
  core: { ww: 25, pt: 50, qa: 25, label: 'Core (25% WW / 50% PT / 25% QA)' },
  academic_math: { ww: 25, pt: 45, qa: 30, label: 'Academic Math (25% WW / 45% PT / 30% QA)' },
  academic_research: { ww: 35, pt: 40, qa: 25, label: 'Academic Research (35% WW / 40% PT / 25% QA)' },
  tvl: { ww: 20, pt: 60, qa: 20, label: 'TVL/Sports/Arts (20% WW / 60% PT / 20% QA)' },
};

// DepEd Order No. 8, s. 2015 Transmutation Table
// Initial Grade -> Transmuted Grade
const TRANSMUTATION_TABLE: Record<number, number> = {
  100: 100, 99: 99, 98: 98, 97: 97, 96: 96, 95: 95, 94: 94, 93: 93, 92: 92, 91: 91,
  90: 90, 89: 89, 88: 88, 87: 87, 86: 86, 85: 85, 84: 84, 83: 83, 82: 82, 81: 81,
  80: 80, 79: 79, 78: 78, 77: 77, 76: 76, 75: 75,
  74: 74, 73: 73, 72: 72, 71: 71, 70: 70, 69: 69, 68: 68, 67: 67, 66: 66, 65: 65,
  64: 64, 63: 63, 62: 62, 61: 61, 60: 60,
};

// Extended transmutation for initial grades below 60
export function transmuteGrade(initial: number): number {
  const rounded = Math.round(initial);
  if (rounded >= 100) return 100;
  if (rounded >= 60) return TRANSMUTATION_TABLE[rounded] ?? 75;
  // Below 60: linear mapping 0-59 -> 0-74
  const below = Math.max(0, rounded);
  return Math.round((below / 60) * 74);
}

export function computeInitialGrade(
  wwScore: number, wwTotal: number,
  ptScore: number, ptTotal: number,
  qaScore: number, qaTotal: number,
  trackType: TrackType
): number {
  const w = TRACK_WEIGHTS[trackType];
  const ww = wwTotal > 0 ? (wwScore / wwTotal) * w.ww : 0;
  const pt = ptTotal > 0 ? (ptScore / ptTotal) * w.pt : 0;
  const qa = qaTotal > 0 ? (qaScore / qaTotal) * w.qa : 0;
  return parseFloat((ww + pt + qa).toFixed(2));
}

export function getSemesterFinal(q1: number | null, q2: number | null): number | null {
  if (q1 === null || q2 === null) return null;
  return parseFloat(((q1 + q2) / 2).toFixed(2));
}

export function getFinalGrade(s1: number | null, s2: number | null): number | null {
  if (s1 === null || s2 === null) return null;
  return parseFloat(((s1 + s2) / 2).toFixed(2));
}

export function getSubjectFinalGrade(grades: Grade[], subjectId: number): number | null {
  const subjectGrades = grades.filter(grade => grade.subject_id === subjectId);
  const q1 = subjectGrades.find(grade => grade.quarter === 1)?.transmuted_grade ?? null;
  const q2 = subjectGrades.find(grade => grade.quarter === 2)?.transmuted_grade ?? null;
  const q3 = subjectGrades.find(grade => grade.quarter === 3)?.transmuted_grade ?? null;
  const q4 = subjectGrades.find(grade => grade.quarter === 4)?.transmuted_grade ?? null;
  return getFinalGrade(getSemesterFinal(q1, q2), getSemesterFinal(q3, q4));
}

export function getGWA(finalGrades: (number | null)[]): number | null {
  const valid = finalGrades.filter((g): g is number => g !== null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((a, b) => a + b, 0);
  return parseFloat((sum / valid.length).toFixed(2));
}

export function getPassFail(grade: number): { pass: boolean; text: string } {
  if (grade >= 75) return { pass: true, text: 'Passed' };
  return { pass: false, text: 'Failed' };
}

export function getGradeDescriptor(grade: number): string {
  if (grade >=95) return 'With High Honor'
  if (grade >= 90) return 'Outstanding';
  if (grade >= 85) return 'Very Satisfactory';
  if (grade >= 80) return 'Satisfactory';
  if (grade >= 75) return 'Fairly Satisfactory';
  return 'Did Not Meet Expectations';
}
