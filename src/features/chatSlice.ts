import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "../type/chatmodal";

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        openChat: (state, action: PayloadAction<string>) => {
            state.isOpen = true;
            state.currentRoomId = action.payload;
        },
        closeChat: (state) => {
            state.isOpen = false;
            state.currentRoomId = null;
        },
        sendMessage: (state, action: PayloadAction<{ text: string }>) => {
            const room = state.rooms.find((r) => r.id === state.currentRoomId);
            if (room) {
                room.messages.push({
                    id: Date.now().toString(),
                    text: action.payload.text,
                    sender: "me"
                });
                
            }
        }
    }
})

export const { openChat, closeChat, sendMessage } = chatSlice.actions;
export default chatSlice.reducer;