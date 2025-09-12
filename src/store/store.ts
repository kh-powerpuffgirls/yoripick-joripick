import { configureStore } from "@reduxjs/toolkit"
import alert from '../features/alertSlice'
import chat from '../features/chatSlice'
import boardsReducer from '../features/boardsSlice';
import auth from '../features/authSlice'
import userReducer from '../features/userSlice'; // user 리듀서 import

export const store = configureStore({
    reducer: {
        alert,
        chat,
        auth,
        boards: boardsReducer,
        user: userReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
