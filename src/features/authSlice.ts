import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type AuthState, type LoginResponse } from "../type/authtype";

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  loading: true
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;