import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialState, type ChatRoom, type Message } from "../type/chatmodal";

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        // 챗 봇 or 문의 내용 초기화 --> 필요한가? 확장할 수 있는가? roomNo로
        resetRoom: (state, action: PayloadAction<string>) => {
            const target = state.rooms.find(room => room.type === action.payload);
            if (target) {
                target.messages = [];
            }
        },
        setRooms: (state, action: PayloadAction<ChatRoom[]>) => {
            action.payload.forEach((room) => {                
                // 새 챗봇이나 문의 추가될 때? --> 잘 기억안남
                if (!state.rooms.some((r) => r.roomNo === room.roomNo && r.type === room.type)) {
                    state.rooms.push(room);
                }
                // noti 정보 변경될 때
                else {
                    state.rooms = action.payload;
                }
            });
        },
        openChat: (state, action: PayloadAction<ChatRoom>) => {
            state.isOpen = true;
            // 열고있는 채팅방을 챗 모달 헤더의 가장 왼쪽에 위치하도록
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
            }
        },
        resetRooms: () => initialState,
        // 참여중인 클래스 목록 빨간딱지
        setLastRead: (state, action: PayloadAction<number|string>) => {
            const room = state.rooms.find(r => r.roomNo == action.payload);
            if (room) {
                room.unreadCount = 0;
            }
        },
        // 클래스룸 탈퇴, 삭제
        leaveRooms: (state, action: PayloadAction<number>) => {
            state.rooms = state.rooms.filter(room => room.roomNo != action.payload);
        },
    }
})

export const { resetRoom, setRooms, openChat, closeChat, sendMessage, resetRooms, setLastRead, leaveRooms } = chatSlice.actions;
export default chatSlice.reducer;