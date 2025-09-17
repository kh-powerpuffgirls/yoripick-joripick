import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type AuthState, type LoginResponse } from "../type/authtype";

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state) => {
      // state.accessToken = action.payload.accessToken;
      // state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;      
    },
    saveUserData: (state, action: PayloadAction<LoginResponse>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    updateProfileImage: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.profile = action.payload;
      }
    },
  },
});

export const { loginSuccess, logout, updateProfileImage } = authSlice.actions;
export default authSlice.reducer;