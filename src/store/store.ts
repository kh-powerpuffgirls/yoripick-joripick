import { configureStore } from "@reduxjs/toolkit"
import alert from '../features/alertSlice'

export const store = configureStore({
    reducer:{
        alert
    }
})

export type RootState = ReturnType<typeof store.getState>