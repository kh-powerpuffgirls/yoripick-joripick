import { configureStore } from "@reduxjs/toolkit"
import alert from '../features/alertSlice'
import chat from '../features/chatSlice'
import auth from '../features/authSlice'
import mying from '../features/myIngSlice'

export const store = configureStore({
    reducer: {
        alert,
        chat,
        auth,
        mying,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch