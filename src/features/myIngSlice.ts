import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import{ notiInitialState, type Ing, type Message } from "../type/ingmodal";

const myIngSlice = createSlice({
    name: "myIng",
    initialState: notiInitialState,
    reducers: {
        setNotification: (state, action: PayloadAction<Message>) => {
            const newNotification = {
                ...action.payload,
                isClosing: false,
            };
            state.message = newNotification;
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.message = state.message = undefined;
        },
        startClosingAnimation: (state, action: PayloadAction<string>) => {
            const notification = state.mes.find((noti) => noti.id === action.payload);
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

export const { 
    removeNotification, 
    startClosingAnimation,
    setSettingsLoading,
    setSettingsError,
    setUserSettings 
 } = myIngSlice.actions;
export default myIngSlice.reducer;