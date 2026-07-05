export type ReadStatus = "unread" | "reading" | "read" | "abandoned";

export interface ProgressEntry {
  workId: string; // <franchise>/<work-slug>, a canon Work id
  status: ReadStatus;
  rating?: number; // 1-5
  dateRead?: string; // ISO date
  note?: string;
}
