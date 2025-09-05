import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "../type/components";
import type { ChatRoomCreate } from "../type/chatmodal";

const alertSlice = createSlice({
    name : 'alert',
    initialState,
    reducers : {
        showAlert : (state, action:PayloadAction<ChatRoomCreate>) => {
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