import { configureStore } from "@reduxjs/toolkit"
import alert from '../features/alertSlice'
import chat from '../features/chatSlice'

export const store = configureStore({
    reducer:{
        alert,
        chat
    }
})

export type RootState = ReturnType<typeof store.getState>