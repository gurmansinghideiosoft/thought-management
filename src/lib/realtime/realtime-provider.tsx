'use client';

import { useEffect } from 'react';

import { api } from '../api/api';
import { useAppDispatch } from '../hooks';
import { getSocket } from './socket';

/**
 * App-wide realtime wiring: a new message in *any* conversation refreshes the
 * conversation list (and its unread badges). Mount once, inside the auth shell.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = getSocket();
    const onBump = () => {
      dispatch(api.util.invalidateTags(['Conversations']));
    };
    socket.on('conversation:bump', onBump);
    return () => {
      socket.off('conversation:bump', onBump);
    };
  }, [dispatch]);

  return <>{children}</>;
}
