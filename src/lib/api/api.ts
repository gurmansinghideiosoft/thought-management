import { createApi } from '@reduxjs/toolkit/query/react';

import { toDateKey } from '../date';
import type {
  ActivityResponse,
  AuthResponse,
  Entry,
  JournalContent,
  JournalEntry,
  JournalListResponse,
  RangeMode,
  RoutineItem,
  Tag,
  TagWithCount,
  Task,
  TaskCalendarResponse,
  TaskStatus,
  TaskTag,
  TaskView,
  Thought,
  ThoughtListResponse,
  ThoughtStats,
  TimelineResponse,
  User,
} from '../types';
import { axiosBaseQuery } from './baseQuery';

export interface ListThoughtsArgs {
  q?: string;
  status?: 'active' | 'archived';
  sort?: 'recent' | 'created' | 'oldest' | 'title';
  page?: number;
  limit?: number;
}

export interface TimelineArgs {
  thoughtId: string;
  tagId?: string;
  starred?: boolean;
  kind?: 'note' | 'link' | 'file';
  q?: string;
  limit?: number;
}

const clean = (obj: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== ''));

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Me',
    'ThoughtList',
    'Thought',
    'Trash',
    'Timeline',
    'Tags',
    'Activity',
    'Stats',
    'Task',
    'TaskCalendar',
    'TaskTag',
    'Routine',
    'Journal',
  ],
  endpoints: (build) => ({
    // --- auth ------------------------------------------------------------
    me: build.query<{ user: User }, void>({
      query: () => ({ url: '/auth/me' }),
      providesTags: ['Me'],
    }),
    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (data) => ({ url: '/auth/login', method: 'POST', data }),
    }),
    register: build.mutation<
      AuthResponse,
      { email: string; password: string; username: string; name?: string }
    >({
      query: (data) => ({ url: '/auth/register', method: 'POST', data }),
    }),
    logout: build.mutation<void, { refreshToken: string | null }>({
      query: (data) => ({ url: '/auth/logout', method: 'POST', data }),
    }),
    updateMe: build.mutation<{ user: User }, { username?: string; name?: string }>({
      query: (data) => ({ url: '/auth/me', method: 'PATCH', data }),
      invalidatesTags: ['Me'],
    }),

    // --- thoughts ------------------------------------------------------
    listThoughts: build.query<ThoughtListResponse, ListThoughtsArgs | void>({
      query: (args) => ({ url: '/thoughts', params: clean({ ...(args ?? {}) }) }),
      providesTags: ['ThoughtList'],
    }),
    listTrash: build.query<ThoughtListResponse, void>({
      query: () => ({ url: '/thoughts/trash' }),
      providesTags: ['Trash'],
    }),
    getThought: build.query<Thought, string>({
      query: (id) => ({ url: `/thoughts/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Thought', id }],
    }),
    getThoughtStats: build.query<ThoughtStats, string>({
      query: (id) => ({ url: `/thoughts/${id}/stats` }),
      providesTags: (_r, _e, id) => [{ type: 'Stats', id }],
    }),
    createThought: build.mutation<
      Thought,
      { title: string; description?: string; tags?: { name: string; color?: string }[] }
    >({
      query: (data) => ({ url: '/thoughts', method: 'POST', data }),
      invalidatesTags: ['ThoughtList'],
    }),
    updateThought: build.mutation<
      Thought,
      { id: string; title?: string; description?: string }
    >({
      query: ({ id, ...data }) => ({ url: `/thoughts/${id}`, method: 'PATCH', data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Thought', id }, 'ThoughtList'],
    }),
    setThoughtArchived: build.mutation<Thought, { id: string; archived: boolean }>({
      query: ({ id, archived }) => ({
        url: `/thoughts/${id}/${archived ? 'archive' : 'unarchive'}`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Thought', id }, 'ThoughtList'],
    }),
    deleteThought: build.mutation<void, string>({
      query: (id) => ({ url: `/thoughts/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Thought', id },
        'ThoughtList',
        'Trash',
        'Activity',
      ],
    }),
    restoreThought: build.mutation<Thought, string>({
      query: (id) => ({ url: `/thoughts/${id}/restore`, method: 'POST' }),
      invalidatesTags: ['ThoughtList', 'Trash', 'Activity'],
    }),

    // --- timeline (infinite; "next page" = older entries) --------------
    timeline: build.infiniteQuery<TimelineResponse, TimelineArgs, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: `/thoughts/${queryArg.thoughtId}/entries`,
        params: clean({
          before: pageParam ?? undefined,
          limit: queryArg.limit ?? 25,
          tagId: queryArg.tagId,
          starred: queryArg.starred,
          kind: queryArg.kind,
          q: queryArg.q,
        }),
      }),
      providesTags: (_r, _e, { thoughtId }) => [{ type: 'Timeline', id: thoughtId }],
    }),

    // --- entries -----------------------------------------------------
    getEntry: build.query<Entry, { thoughtId: string; entryId: string }>({
      query: ({ thoughtId, entryId }) => ({
        url: `/thoughts/${thoughtId}/entries/${entryId}`,
      }),
    }),
    addEntry: build.mutation<
      Entry,
      {
        thoughtId: string;
        kind: 'note' | 'link';
        body?: string;
        link?: { url: string; title?: string };
        tagIds?: string[];
      }
    >({
      query: ({ thoughtId, ...data }) => ({
        url: `/thoughts/${thoughtId}/entries`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (_r, _e, { thoughtId }) => [
        { type: 'Timeline', id: thoughtId },
        { type: 'Thought', id: thoughtId },
        { type: 'Stats', id: thoughtId },
        'Activity',
      ],
    }),
    uploadEntryFile: build.mutation<Entry, { thoughtId: string; form: FormData }>({
      query: ({ thoughtId, form }) => ({
        url: `/thoughts/${thoughtId}/entries/files`,
        method: 'POST',
        data: form,
      }),
      invalidatesTags: (_r, _e, { thoughtId }) => [
        { type: 'Timeline', id: thoughtId },
        { type: 'Thought', id: thoughtId },
        { type: 'Stats', id: thoughtId },
        'Activity',
      ],
    }),
    updateEntry: build.mutation<
      Entry,
      {
        thoughtId: string;
        entryId: string;
        body?: string;
        link?: { url: string; title?: string };
        tagIds?: string[];
      }
    >({
      query: ({ thoughtId, entryId, ...data }) => ({
        url: `/thoughts/${thoughtId}/entries/${entryId}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (_r, _e, { thoughtId }) => [{ type: 'Timeline', id: thoughtId }],
    }),
    setEntryStarred: build.mutation<
      Entry,
      { thoughtId: string; entryId: string; starred: boolean }
    >({
      query: ({ thoughtId, entryId, starred }) => ({
        url: `/thoughts/${thoughtId}/entries/${entryId}/star`,
        method: 'PUT',
        data: { starred },
      }),
      invalidatesTags: (_r, _e, { thoughtId }) => [{ type: 'Timeline', id: thoughtId }],
    }),
    deleteEntry: build.mutation<void, { thoughtId: string; entryId: string }>({
      query: ({ thoughtId, entryId }) => ({
        url: `/thoughts/${thoughtId}/entries/${entryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { thoughtId }) => [
        { type: 'Timeline', id: thoughtId },
        { type: 'Thought', id: thoughtId },
        { type: 'Stats', id: thoughtId },
        'Activity',
      ],
    }),
    attachEntryTag: build.mutation<
      Entry,
      { thoughtId: string; entryId: string; tagId: string }
    >({
      query: ({ thoughtId, entryId, tagId }) => ({
        url: `/thoughts/${thoughtId}/entries/${entryId}/tags`,
        method: 'POST',
        data: { tagId },
      }),
      invalidatesTags: (_r, _e, { thoughtId }) => [
        { type: 'Timeline', id: thoughtId },
        { type: 'Tags', id: thoughtId },
      ],
    }),
    detachEntryTag: build.mutation<
      Entry,
      { thoughtId: string; entryId: string; tagId: string }
    >({
      query: ({ thoughtId, entryId, tagId }) => ({
        url: `/thoughts/${thoughtId}/entries/${entryId}/tags/${tagId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { thoughtId }) => [
        { type: 'Timeline', id: thoughtId },
        { type: 'Tags', id: thoughtId },
      ],
    }),

    // --- tags ------------------------------------------------------
    listTags: build.query<TagWithCount[], string>({
      query: (thoughtId) => ({ url: `/thoughts/${thoughtId}/tags` }),
      transformResponse: (r: { items: TagWithCount[] }) => r.items,
      providesTags: (_r, _e, thoughtId) => [{ type: 'Tags', id: thoughtId }],
    }),
    createTag: build.mutation<Tag, { thoughtId: string; name: string; color?: string }>({
      query: ({ thoughtId, ...data }) => ({
        url: `/thoughts/${thoughtId}/tags`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (_r, _e, { thoughtId }) => [
        { type: 'Tags', id: thoughtId },
        { type: 'Thought', id: thoughtId },
      ],
    }),
    updateTag: build.mutation<
      Tag,
      { thoughtId: string; tagId: string; name?: string; color?: string }
    >({
      query: ({ thoughtId, tagId, ...data }) => ({
        url: `/thoughts/${thoughtId}/tags/${tagId}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (_r, _e, { thoughtId }) => [
        { type: 'Tags', id: thoughtId },
        { type: 'Thought', id: thoughtId },
        { type: 'Timeline', id: thoughtId },
      ],
    }),
    deleteTag: build.mutation<void, { thoughtId: string; tagId: string }>({
      query: ({ thoughtId, tagId }) => ({
        url: `/thoughts/${thoughtId}/tags/${tagId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { thoughtId }) => [
        { type: 'Tags', id: thoughtId },
        { type: 'Thought', id: thoughtId },
        { type: 'Timeline', id: thoughtId },
      ],
    }),

    // --- activity (infinite; newest first) ---------------------------
    activity: build.infiniteQuery<
      ActivityResponse,
      {
        kind?: 'note' | 'link' | 'file';
        from?: string;
        to?: string;
        limit?: number;
      } | void,
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: '/activity',
        params: clean({
          cursor: pageParam ?? undefined,
          limit: queryArg?.limit ?? 30,
          kind: queryArg?.kind,
          from: queryArg?.from,
          to: queryArg?.to,
        }),
      }),
      providesTags: ['Activity'],
    }),

    // --- tasks -----------------------------------------------------------
    listTasks: build.query<
      { items: TaskView[] },
      {
        from?: string;
        to?: string;
        status?: TaskStatus;
        tags?: string[];
        priorities?: number[];
        q?: string;
      }
    >({
      query: (args) => ({
        url: '/tasks',
        params: clean({
          from: args.from,
          to: args.to,
          today: toDateKey(new Date()),
          status: args.status,
          q: args.q,
          tags: args.tags?.length ? args.tags.join(',') : undefined,
          priority: args.priorities?.length ? args.priorities.join(',') : undefined,
        }),
      }),
      providesTags: ['Task'],
    }),
    taskCalendar: build.query<
      TaskCalendarResponse,
      { month: string; status?: TaskStatus; tags?: string[]; priorities?: number[] }
    >({
      query: (args) => ({
        url: '/tasks/calendar',
        params: clean({
          month: args.month,
          today: toDateKey(new Date()),
          status: args.status,
          tags: args.tags?.length ? args.tags.join(',') : undefined,
          priority: args.priorities?.length ? args.priorities.join(',') : undefined,
        }),
      }),
      providesTags: ['TaskCalendar'],
    }),
    createTask: build.mutation<
      Task,
      | { content: string; date: string; priority?: number; tagIds?: string[] }
      | {
          kind: 'range';
          content: string;
          startDate: string;
          endDate: string;
          rangeMode: RangeMode;
          priority?: number;
          tagIds?: string[];
        }
    >({
      query: (data) => ({ url: '/tasks', method: 'POST', data }),
      invalidatesTags: ['Task', 'TaskCalendar'],
    }),
    updateTask: build.mutation<
      Task,
      {
        id: string;
        content?: string;
        date?: string;
        priority?: number;
        tagIds?: string[];
      }
    >({
      query: ({ id, ...data }) => ({ url: `/tasks/${id}`, method: 'PATCH', data }),
      invalidatesTags: ['Task', 'TaskCalendar'],
    }),
    setTaskStatus: build.mutation<Task, { id: string; status: TaskStatus }>({
      query: ({ id, status }) => ({
        url: `/tasks/${id}/status`,
        method: 'PUT',
        data: { status },
      }),
      invalidatesTags: ['Task', 'TaskCalendar'],
    }),
    /** Materialize + set status on a virtual routine / range-daily occurrence. */
    setVirtualTaskStatus: build.mutation<
      Task,
      {
        date: string;
        status: TaskStatus;
        routineItemId?: string;
        rangeTaskId?: string;
      }
    >({
      query: (data) => ({ url: '/tasks/virtual/status', method: 'PUT', data }),
      invalidatesTags: ['Task', 'TaskCalendar'],
    }),
    deleteTask: build.mutation<void, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Task', 'TaskCalendar'],
    }),

    // --- routine -------------------------------------------------------
    getRoutine: build.query<RoutineItem[], void>({
      query: () => ({ url: '/routine' }),
      transformResponse: (r: { items: RoutineItem[] }) => r.items,
      providesTags: ['Routine'],
    }),
    addRoutineItem: build.mutation<
      RoutineItem,
      { content: string; priority?: number; tagIds?: string[] }
    >({
      query: (data) => ({ url: '/routine/items', method: 'POST', data }),
      invalidatesTags: ['Routine', 'Task', 'TaskCalendar'],
    }),
    updateRoutineItem: build.mutation<
      RoutineItem,
      { id: string; content?: string; priority?: number; tagIds?: string[] }
    >({
      query: ({ id, ...data }) => ({
        url: `/routine/items/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Routine', 'Task', 'TaskCalendar'],
    }),
    removeRoutineItem: build.mutation<void, string>({
      query: (id) => ({ url: `/routine/items/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Routine', 'Task', 'TaskCalendar'],
    }),
    reorderRoutineItems: build.mutation<{ items: RoutineItem[] }, string[]>({
      query: (itemIds) => ({
        url: '/routine/items/order',
        method: 'PUT',
        data: { itemIds },
      }),
      invalidatesTags: ['Routine', 'Task', 'TaskCalendar'],
    }),

    // --- task tags -----------------------------------------------------
    listTaskTags: build.query<TaskTag[], void>({
      query: () => ({ url: '/task-tags' }),
      transformResponse: (r: { items: TaskTag[] }) => r.items,
      providesTags: ['TaskTag'],
    }),
    createTaskTag: build.mutation<TaskTag, { name: string; color?: string }>({
      query: (data) => ({ url: '/task-tags', method: 'POST', data }),
      invalidatesTags: ['TaskTag'],
    }),
    updateTaskTag: build.mutation<TaskTag, { id: string; name?: string; color?: string }>(
      {
        query: ({ id, ...data }) => ({ url: `/task-tags/${id}`, method: 'PATCH', data }),
        invalidatesTags: ['TaskTag', 'Task', 'TaskCalendar'],
      },
    ),
    deleteTaskTag: build.mutation<void, string>({
      query: (id) => ({ url: `/task-tags/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TaskTag', 'Task', 'TaskCalendar'],
    }),

    // --- journal ------------------------------------------------------
    listJournal: build.infiniteQuery<JournalListResponse, void, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ pageParam }) => ({
        url: '/journal',
        params: clean({ cursor: pageParam ?? undefined, limit: 12 }),
      }),
      providesTags: ['Journal'],
    }),
    getJournalEntry: build.query<JournalEntry, string>({
      query: (id) => ({ url: `/journal/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Journal', id }],
    }),
    upsertJournalByDate: build.mutation<
      JournalEntry,
      { date: string; title?: string; content?: JournalContent }
    >({
      query: ({ date, ...body }) => ({
        url: `/journal/by-date/${date}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Journal'],
    }),
    updateJournalEntry: build.mutation<
      JournalEntry,
      {
        id: string;
        title?: string;
        content?: JournalContent;
        excerpt?: string;
        wordCount?: number;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/journal/${id}`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Journal', id }, 'Journal'],
    }),
    deleteJournalEntry: build.mutation<void, string>({
      query: (id) => ({ url: `/journal/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Journal'],
    }),
  }),
});

export const {
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateMeMutation,
  useListThoughtsQuery,
  useListTrashQuery,
  useGetThoughtQuery,
  useGetThoughtStatsQuery,
  useCreateThoughtMutation,
  useUpdateThoughtMutation,
  useSetThoughtArchivedMutation,
  useDeleteThoughtMutation,
  useRestoreThoughtMutation,
  useTimelineInfiniteQuery,
  useLazyGetEntryQuery,
  useAddEntryMutation,
  useUploadEntryFileMutation,
  useUpdateEntryMutation,
  useSetEntryStarredMutation,
  useDeleteEntryMutation,
  useAttachEntryTagMutation,
  useDetachEntryTagMutation,
  useListTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useActivityInfiniteQuery,
  useListTasksQuery,
  useTaskCalendarQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useSetTaskStatusMutation,
  useSetVirtualTaskStatusMutation,
  useDeleteTaskMutation,
  useGetRoutineQuery,
  useAddRoutineItemMutation,
  useUpdateRoutineItemMutation,
  useRemoveRoutineItemMutation,
  useReorderRoutineItemsMutation,
  useListTaskTagsQuery,
  useCreateTaskTagMutation,
  useUpdateTaskTagMutation,
  useDeleteTaskTagMutation,
  useListJournalInfiniteQuery,
  useGetJournalEntryQuery,
  useUpsertJournalByDateMutation,
  useUpdateJournalEntryMutation,
  useDeleteJournalEntryMutation,
} = api;
