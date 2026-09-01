/** Response shapes from the thought-management API. */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type ThoughtStatus = 'active' | 'archived';

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface TagWithCount extends Tag {
  entryCount: number;
}

export interface Thought {
  id: string;
  title: string;
  description: string;
  status: ThoughtStatus;
  tags: Tag[];
  entryCount: number;
  lastEntryAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EntryKind = 'note' | 'link' | 'file';

export interface EntryLink {
  url: string;
  title?: string;
}

export interface EntryFile {
  key: string;
  originalName: string;
  contentType: string;
  size: number;
  category: 'image' | 'document';
}

export interface Entry {
  id: string;
  thoughtId: string;
  kind: EntryKind;
  body: string;
  link?: EntryLink;
  file?: EntryFile;
  tagIds: string[];
  starred: boolean;
  createdAt: string;
  updatedAt: string;
  /** Present on single-entry and file-create responses. */
  downloadUrl?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ThoughtListResponse {
  items: Thought[];
  pagination: Pagination;
}

export interface TimelineResponse {
  items: Entry[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ActivityItem extends Entry {
  thought: { id: string; title: string | null };
}

export interface ActivityResponse {
  items: ActivityItem[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ThoughtStats {
  totalEntries: number;
  starredEntries: number;
  firstEntryAt: string | null;
  lastEntryAt: string | null;
  byKind: Record<EntryKind, number>;
  byTag: { tagId: string; name: string; count: number }[];
}

export interface ApiErrorShape {
  error: { message: string; details?: unknown };
}

// --- tasks ---------------------------------------------------------------

export interface TaskTag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'done' | 'skipped';
export type TaskKind = 'single' | 'range';
export type RangeMode = 'once' | 'daily';

/** The stored task entity — what create / update / status mutations return. */
export interface Task {
  id: string;
  content: string;
  /** `YYYY-MM-DD`. `null` on a `range` row (it uses start/end instead). */
  date: string | null;
  status: TaskStatus;
  completedAt: string | null;
  priority: number;
  tagIds: string[];
  kind: TaskKind;
  startDate: string | null;
  endDate: string | null;
  rangeMode: RangeMode | null;
  /** Set on a materialized instance of a routine item / range-daily task. */
  routineItemId: string | null;
  rangeTaskId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * A task as it appears on one calendar day — what `GET /tasks` returns. Either a
 * stored row (`virtual: false`) or a synthetic occurrence of a routine item or
 * `range/daily` task (`virtual: true`, `id` = `routine:<itemId>` / `range:<id>`).
 */
export interface TaskView extends Task {
  /** Unique per (task, day) — use as the React key. */
  viewKey: string;
  /** The calendar day this occurrence belongs to (`YYYY-MM-DD`). */
  day: string;
  date: string;
  virtual: boolean;
}

export interface RoutineItem {
  id: string;
  content: string;
  priority: number;
  tagIds: string[];
  position: number;
  /** Inclusive `YYYY-MM-DD` the item started applying. */
  activeFrom: string;
  /** Inclusive last day it applies, or `null` while still active. */
  activeTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCalendarResponse {
  month: string;
  counts: Record<string, { pending: number; done: number }>;
}

// --- journal -----------------------------------------------------------

/** A Tiptap / ProseMirror document. */
export type JournalContent = { type: string; content?: unknown[] } & Record<
  string,
  unknown
>;

export interface JournalEntry {
  id: string;
  /** `YYYY-MM-DD` */
  date: string;
  title: string;
  content: JournalContent;
  excerpt: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JournalListResponse {
  items: JournalEntry[];
  hasMore: boolean;
  nextCursor: string | null;
}
