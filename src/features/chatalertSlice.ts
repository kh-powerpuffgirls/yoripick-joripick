import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { chatInitialState } from "../type/components";
import type { ChatRoomCreate } from "../type/chatmodal";

const alertSlice = createSlice({
    name : 'chatalert',
    initialState : chatInitialState,
    reducers : {
        showAlert : (state, action:PayloadAction<ChatRoomCreate | null>) => {
            state.type = action.payload;
            state.visible = true;
        },
        hideAlert : (state) => {
            state.type = null;
            state.visible = false;
        }
    }
})

export const {showAlert, hideAlert} = alertSlice.actions;
export default alertSlice.reducer;