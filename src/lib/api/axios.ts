import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { tokenStore } from '../auth/tokenStore';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

/** Shared axios instance. Every API call goes through this. */
export const http = axios.create({ baseURL: API_BASE_URL });

// --- request: attach the bearer token ------------------------------------

http.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// --- response: refresh once on 401, then replay -------------------------

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Concurrent 401s share one in-flight refresh instead of stampeding it.
let refreshInFlight: Promise<string | null> | null = null;

const performRefresh = async (): Promise<string | null> => {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
    );
    tokenStore.set(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
};

const forceLogout = (): void => {
  tokenStore.clear();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    // Hard navigation from outside React (interceptor context) — deliberately
    // drops all in-memory state on an unrecoverable auth failure.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login';
  }
};

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isRefreshCall = original?.url?.includes('/auth/refresh');

    if (error.response?.status !== 401 || !original || original._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshInFlight ??= performRefresh().finally(() => {
      refreshInFlight = null;
    });
    const newToken = await refreshInFlight;

    if (!newToken) {
      forceLogout();
      return Promise.reject(error);
    }

    original.headers.set('Authorization', `Bearer ${newToken}`);
    return http(original);
  },
);
