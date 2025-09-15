import { configureStore } from "@reduxjs/toolkit"
import chatalert from '../features/chatalertSlice'
import alert from '../features/alertSlice'
import chat from '../features/chatSlice'
import auth from '../features/authSlice'
import noti from '../features/notiSlice'

export const store = configureStore({
    reducer: {
        chatalert,
        alert,
        chat,
        auth, 
        noti
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch