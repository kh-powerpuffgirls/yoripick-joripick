import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialState, type ChatRoom, type Message } from "../type/chatmodal";

interface LastReadPayload {
    roomNo: number|string;
    lastReadMessageNo: number;
}

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        resetRoom: (state, action: PayloadAction<string>) => {
            const target = state.rooms.find(room => room.type === action.payload);
            if (target) {
                target.messages = [];
            }
        },
        setRooms: (state, action: PayloadAction<ChatRoom[]>) => {
            action.payload.forEach((room) => {
                if (!state.rooms.some((r) => r.roomNo === room.roomNo && r.type === room.type)) {
                    state.rooms.push(room);
                }
            });
        },
        openChat: (state, action: PayloadAction<ChatRoom>) => {
            state.isOpen = true;
            const exists = state.rooms.some(room => room.roomNo === action.payload.roomNo);
            if (!exists) {
                state.rooms = state.rooms.filter(room => room.className !== action.payload.className);
                state.rooms.unshift(action.payload);
            }
            state.currentRoomId = action.payload.roomNo;
        },
        closeChat: (state) => {
            state.isOpen = false;
        },
        sendMessage: (state, action: PayloadAction<Message>) => {
            const room = state.rooms.find((r) => r.roomNo === action.payload.roomNo);
            if (room) {
                // 마지막 읽은 메시지 번호 자동 업데이트 (보낸 메시지는 당연히 읽음 처리)
                room.lastReadMessageNo = action.payload.messageNo;
                room.messages.push(action.payload);
                // 최근 방 맨 위로
                state.rooms = state.rooms.filter(r => r.roomNo !== room.roomNo);
                state.rooms.unshift(room);

                // 안읽은메세지 처리하기..
            }
        },
        resetRooms: () => initialState,
        setLastRead: (state, action: PayloadAction<LastReadPayload>) => {
            const room = state.rooms.find(r => r.roomNo === action.payload.roomNo);
            if (room) {
                room.lastReadMessageNo = action.payload.lastReadMessageNo;
            }
        },
    }
})

export const { resetRoom, setRooms, openChat, closeChat, sendMessage, resetRooms, setLastRead } = chatSlice.actions;
export default chatSlice.reducer;