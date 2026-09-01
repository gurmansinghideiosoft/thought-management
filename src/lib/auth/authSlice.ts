import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '../types';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  user: User | null;
  status: AuthStatus;
}

const initialState: AuthState = { user: null, status: 'idle' };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authLoading: (state) => {
      state.status = 'loading';
    },
    authenticated: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.status = 'authenticated';
    },
    signedOut: (state) => {
      state.user = null;
      state.status = 'anonymous';
    },
  },
});

export const { authLoading, authenticated, signedOut } = authSlice.actions;
export default authSlice.reducer;
