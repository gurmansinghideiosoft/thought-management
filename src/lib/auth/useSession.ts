'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { api, useLogoutMutation, useMeQuery } from '../api/api';
import { useAppDispatch, useAppSelector } from '../hooks';
import { authLoading, authenticated, signedOut } from './authSlice';
import { tokenStore } from './tokenStore';

/**
 * Bootstraps and exposes the auth session. On mount it fetches `/auth/me` if a
 * token is present; a failure clears the token. `signOut` revokes the tokens
 * server-side and wipes local state.
 */
export function useSession() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((s) => s.auth);
  const hasToken = tokenStore.hasSession();

  const meQuery = useMeQuery(undefined, { skip: !hasToken });
  const [logout] = useLogoutMutation();
  const router = useRouter();

  useEffect(() => {
    if (!hasToken) {
      dispatch(signedOut());
      return;
    }
    if (meQuery.isFetching) {
      dispatch(authLoading());
      return;
    }
    if (meQuery.data) {
      dispatch(authenticated(meQuery.data.user));
      return;
    }
    if (meQuery.isError) {
      tokenStore.clear();
      dispatch(signedOut());
    }
  }, [hasToken, meQuery.isFetching, meQuery.data, meQuery.isError, dispatch]);

  const signOut = async () => {
    try {
      await logout({ refreshToken: tokenStore.getRefresh() }).unwrap();
    } catch {
      /* revoke best-effort */
    }
    tokenStore.clear();
    dispatch(signedOut());
    dispatch(api.util.resetApiState());
    router.replace('/login');
  };

  return {
    user,
    status,
    signOut,
    isAuthenticated: status === 'authenticated',
    isResolved: status === 'authenticated' || status === 'anonymous',
  };
}
