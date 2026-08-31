import { createApi } from '@reduxjs/toolkit/query/react';

import type {
  ActivityResponse,
  AuthResponse,
  Entry,
  Tag,
  TagWithCount,
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
      { email: string; password: string; name?: string }
    >({
      query: (data) => ({ url: '/auth/register', method: 'POST', data }),
    }),
    logout: build.mutation<void, { refreshToken: string | null }>({
      query: (data) => ({ url: '/auth/logout', method: 'POST', data }),
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
  }),
});

export const {
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
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
} = api;
