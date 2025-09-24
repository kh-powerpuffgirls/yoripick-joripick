// src/features/userSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface UserState {
  isLoggedIn: boolean;
  userNo: number | null; // <-- 이 부분을 추가합니다.
}

const initialState: UserState = {
  isLoggedIn: false,
  userNo: null, // <-- 초기 상태에도 userNo를 추가합니다.
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ userNo: number }>) => { // action.payload에 userNo를 받도록 수정
      state.isLoggedIn = true;
      state.userNo = action.payload.userNo;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userNo = null;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;