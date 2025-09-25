import { configureStore } from "@reduxjs/toolkit"
import chatalert from '../features/chatalertSlice'
import alert from '../features/alertSlice'
import chat from '../features/chatSlice'
import auth from '../features/authSlice'
import noti from '../features/notiSlice'
import stomp from '../features/stompSlice'
import adminModal from '../features/adminModalSlice'
import adminState from '../features/adminStateSlice'
import mying from '../features/myIngSlice'
import boardsReducer from '../features/boardsSlice';


export const store = configureStore({
    reducer: {
        adminState,
        adminModal,
        stomp,
        chatalert,
        alert,
        chat,
        auth,
        mying,
        boards: boardsReducer,
        noti,
    }
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
