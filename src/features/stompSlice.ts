import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface StompState {
  connected: boolean;
  subscribedRooms: string[];
}

const initialState: StompState = {
  connected: false,
  subscribedRooms: [],
};

const stompSlice = createSlice({
  name: "stomp",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    addSubscribedRoom: (state, action: PayloadAction<string>) => {
      if (!state.subscribedRooms.includes(action.payload)) {
        state.subscribedRooms.push(action.payload);
      }
    },
    removeSubscribedRoom: (state, action: PayloadAction<string>) => {
      state.subscribedRooms = state.subscribedRooms.filter(
        (r) => r !== action.payload
      );
    },
    clearSubscribedRooms: (state) => {
      state.subscribedRooms = [];
    },
  },
});

export const {
  setConnected,
  addSubscribedRoom,
  removeSubscribedRoom,
  clearSubscribedRooms,
} = stompSlice.actions;

export default stompSlice.reducer;
