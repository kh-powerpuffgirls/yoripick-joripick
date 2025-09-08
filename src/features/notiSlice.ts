import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { notiInitialState } from "../type/components";
import type { Message } from "../type/chatmodal";

const notificationSlice = createSlice({
    name: "noti",
    initialState: notiInitialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Message>) => {
            const newNotification = {
                ...action.payload,
                id: Math.random().toString(36).substring(2, 9),
                isClosing: false,
            };
            state.list.push(newNotification);
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.list = state.list.filter((noti) => noti.id !== action.payload);
        },
        startClosingAnimation: (state, action: PayloadAction<string>) => {
            const notification = state.list.find((noti) => noti.id === action.payload);
            if (notification) {
                notification.isClosing = true;
            }
        },
    },
});

export const { addNotification, removeNotification, startClosingAnimation } = notificationSlice.actions;
export default notificationSlice.reducer;