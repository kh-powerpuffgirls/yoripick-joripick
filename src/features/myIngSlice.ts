import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import{ initialState, type Ing, type Message } from "../type/ingmodal";

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
        setNotification: (state, action: PayloadAction<Message>) => {
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
        setSettingsLoading: (state, action: PayloadAction<boolean>) => {
            state.isSettingsLoading = action.payload;
        },
        setSettingsError: (state, action: PayloadAction<string | null>) => {
            state.settingsError = action.payload;
        },
        setUserSettings: (state, action: PayloadAction<UserNotiSettings>) => {
            state.userSettings = action.payload;
        },
        checkAlert: (state, action: PayloadAction<Ing>) => {
            state.isChecked = true;
        }
    }
})

export const { checkAlert } = myIngSlice.actions;
export default myIngSlice.reducer;