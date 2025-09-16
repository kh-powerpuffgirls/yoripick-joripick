import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "../type/components";

const alertSlice = createSlice({
    name: 'alert',
    initialState,
    reducers: {
        showAlert: (state, action: PayloadAction<React.ReactNode>) => {
            state.htmlComponent = action.payload;
            state.visible = true;
        },
        hideAlert: (state) => {
            state.htmlComponent = null;
            state.visible = false;
        }
    }
})

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;