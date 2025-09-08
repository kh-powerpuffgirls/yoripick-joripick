import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { notiInitialState } from "../type/components";
import type { Message } from "../type/chatmodal";

const notificationSlice = createSlice({
    name: "noti",
    initialState: notiInitialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Message>) => {
            state.list.push(action.payload);
        },
        removeNotification: (state, action: PayloadAction<Message>) => {
            state.list = state.list.filter(msg => msg.createdAt !== action.payload.createdAt);
        },
        clearNotifications: (state) => {
            state.list = [];
        },
    },
});

export const { addNotification, removeNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;