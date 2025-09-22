import { configureStore } from "@reduxjs/toolkit"
import chatalert from '../features/chatalertSlice'
import alert from '../features/alertSlice'
import chat from '../features/chatSlice'
import boardsReducer from '../features/boardsSlice';
import auth from '../features/authSlice'
import noti from '../features/notiSlice'
import userReducer from '../features/userSlice';
import stomp from '../features/stompSlice';
import adminModal from '../features/adminModalSlice'

export const store = configureStore({
    reducer: {
        adminModal,
        stomp,
        chatalert,
        alert,
        chat,
        auth, 
        noti,
        boards: boardsReducer,
        user: userReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
