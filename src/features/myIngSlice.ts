import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// import { initialState, type ChatRoom, type Message } from "../type/chatmodal";
import{ initialState, type Ing } from "../type/ingmodal";

const myIngSlice = createSlice({
    name: "myIng",
    initialState,
    reducers: {
        // resetRoom: (state, action: PayloadAction<string>) => {
        //     const target = state.ings.find(ing => ing.type === action.payload);
        //     if (target) {
        //         target.messages = [];
        //     }
        // },
        checkAlert: (state, action: PayloadAction<Ing>) => {
            state.isChecked = true;
        }
    }
})

export const { checkAlert } = myIngSlice.actions;
export default myIngSlice.reducer;