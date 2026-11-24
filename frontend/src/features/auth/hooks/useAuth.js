import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authApi, getApiError } from "../api/authApi.js";
import { clearSession, setError, setLoading, setReady, setSession } from "../state/authSlice.js";

let sessionRestorePromise;

function restoreSessionOnce() {
  if (!sessionRestorePromise) {
    sessionRestorePromise = (async () => {
      const refreshed = await authApi.refresh();
      const profile = await authApi.me(refreshed.accessToken);
      return { accessToken: refreshed.accessToken, user: profile.user };
    })().finally(() => {
      sessionRestorePromise = null;
    });
  }
  return sessionRestorePromise;
}

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    let active = true;
    if (!auth.ready) {
      restoreSessionOnce()
        .then((session) => {
          if (active) dispatch(setSession(session));
        })
        .catch((error) => {
          if (active && error.response?.status === 401) {
            dispatch(setReady());
          } else if (active) {
            dispatch(setError(getApiError(error)));
          }
        });
    }
    return () => { active = false; };
  }, [auth.ready, dispatch]);

  const authenticate = useCallback(async (mode, fields) => {
    dispatch(setLoading(true));
    try {
      const result = await authApi[mode](fields);
      dispatch(setSession({ accessToken: result.accessToken, user: result.user }));
      return true;
    } catch (error) {
      dispatch(setError(getApiError(error)));
      return false;
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      await authApi.logout();
      dispatch(clearSession());
    } catch (error) {
      dispatch(setError(getApiError(error)));
    }
  }, [dispatch]);

  return {
    ...auth,
    login: (fields) => authenticate("login", fields),
    register: (fields) => authenticate("register", fields),
    logout
  };
}
