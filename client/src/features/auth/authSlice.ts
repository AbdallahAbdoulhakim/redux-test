import { createSlice } from "@reduxjs/toolkit";

interface AuthUser {
  id: number | null;
  username: string | null;
}

type AuthState = {
  status: "idle" | "pending" | "failed" | "succeeded";
  currentUser: AuthUser;
  error: string | null;
};

const initialState: AuthState = {
  status: "idle",
  currentUser: {
    id: null,
    username: null,
  },
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
});

export default authSlice.reducer;
