import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type AuthState, type LoginResponse, type User } from "../type/authtype";

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
    updateImageNo: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.imageNo = action.payload;
      }
    },
    updateUserInfo: (
      state,
      action: PayloadAction<Partial<Pick<User, "username" | "email">>>
    ) => {
      if (state.user) {
        if (action.payload.username) state.user.username = action.payload.username;
        if (action.payload.email) state.user.email = action.payload.email;
      }
    },
    updateAlarmSettings: (
      state,
      action: PayloadAction<Pick<User, "msgNoti" | "replyNoti" | "rvwNoti" | "expNoti">>
    ) => {
      if (state.user) {
        state.user.msgNoti = action.payload.msgNoti;
        state.user.replyNoti = action.payload.replyNoti;
        state.user.rvwNoti = action.payload.rvwNoti;
        state.user.expNoti = action.payload.expNoti;
      }
    },
    updateUserAllergies: (state, action: PayloadAction<number[]>) => {
      if (state.user) state.user.allergies = action.payload;
    },
    updateSikBti(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.sikbti = action.payload;
      }
    },
  },
});

export const { loginSuccess, saveUserData, logout, updateProfileImage, updateImageNo, updateUserInfo, updateAlarmSettings, updateUserAllergies, updateSikBti, } = authSlice.actions;
export default authSlice.reducer;