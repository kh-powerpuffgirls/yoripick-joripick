import { configureStore } from "@reduxjs/toolkit"
import alert from '../features/alertSlice'
import chat from '../features/chatSlice'
import boardsReducer from '../features/boardsSlice';

export const store = configureStore({
    reducer:{
        alert,
        chat,
        boards: boardsReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;