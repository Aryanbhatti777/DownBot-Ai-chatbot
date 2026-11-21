import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, accessToken: null, ready: false, loading: false, error: null },
  reducers: {
    setSession(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.ready = true;
      state.loading = false;
      state.error = null;
    },
    setReady(state) {
      state.ready = true;
      state.loading = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.ready = true;
      state.loading = false;
    },
    clearSession(state) {
      state.user = null;
      state.accessToken = null;
      state.ready = true;
      state.loading = false;
      state.error = null;
    }
  }
});

export const { setSession, setReady, setLoading, setError, clearSession } = authSlice.actions;
export default authSlice.reducer;
