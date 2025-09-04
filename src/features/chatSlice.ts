import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialState, type ChatRoom, type Message } from "../type/chatmodal";

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setRooms: (state, action: PayloadAction<ChatRoom[]>) => {
            state.rooms = action.payload;
        },
        openChat: (state, action: PayloadAction<ChatRoom>) => {
            state.isOpen = true;
            const exists = state.rooms.some(room => room.classNo === action.payload.classNo);
            if (!exists) {
                state.rooms = state.rooms.filter(room => room.className !== action.payload.className);
                state.rooms.unshift(action.payload);
            }
            state.currentRoomId = action.payload.classNo;
        },
        closeChat: (state) => {
            state.isOpen = false;
        },
        sendMessage: (state, action: PayloadAction<Message>) => {
            const room = state.rooms.find((r) => r.classNo === state.currentRoomId);
            if (room) {
                room.messages.push({
                    content: action.payload.content,
                    username: action.payload.username,
                    button: action.payload.button
                });
                state.rooms = state.rooms.filter(r => r.classNo !== room.classNo);
                state.rooms.unshift(room);
            }
        }
    }
})

export const { setRooms, openChat, closeChat, sendMessage } = chatSlice.actions;
export default chatSlice.reducer;