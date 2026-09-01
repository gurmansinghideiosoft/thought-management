import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { type AxiosError, type AxiosRequestConfig } from 'axios';

import { http } from './axios';

export interface AxiosQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: AxiosRequestConfig['headers'];
}

export interface ApiError {
  status: number | undefined;
  data: unknown;
}

/** Extract a human message from whatever the API/axios handed back. */
export const errorMessage = (
  error: unknown,
  fallback = 'Something went wrong',
): string => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as ApiError).data;
    if (data && typeof data === 'object' && 'error' in data) {
      const inner = (data as { error?: { message?: unknown } }).error;
      if (inner && typeof inner.message === 'string') return inner.message;
    }
    if (typeof data === 'string') return data;
  }
  return fallback;
};

/** RTK Query base query implemented over the shared axios instance. */
export const axiosBaseQuery =
  (): BaseQueryFn<AxiosQueryArgs, unknown, ApiError> =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await http({ url, method, data, params, headers });
      return { data: result.data };
    } catch (err) {
      const axiosErr = err as AxiosError;
      return {
        error: {
          status: axiosErr.response?.status,
          data: axiosErr.response?.data ?? axiosErr.message,
        },
      };
    }
  };
