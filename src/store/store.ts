// src/store.ts

import { configureStore } from "@reduxjs/toolkit";
import boardsReducer from '../features/boardsSlice';

export const store = configureStore({
    reducer: {
        // 리듀서 작성 하는 곳
        boards: boardsReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;