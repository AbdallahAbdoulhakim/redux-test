import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

interface AuthUser {
  id: number | null;
  username: string | null;
}

type AuthState = {
  status: "idle" | "pending" | "failed" | "succeeded";
  currentUser: AuthUser;
  error: string | null;
  token: string | null;
};

const initialState: AuthState = {
  status: "idle",
  currentUser: {
    id: null,
    username: null,
  },
  token: null,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.currentUser = user;
      state.token = token;
    },
    logOut: (state) => {
      state.currentUser = {
        id: null,
        username: null,
      };
      state.token = null;
      state.status = "idle";
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectCurrentToken = (state: RootState) => state.auth.token;
