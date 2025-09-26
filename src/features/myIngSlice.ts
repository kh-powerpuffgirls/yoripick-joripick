import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import{ notiInitialState, type Ing} from "../type/ingmodal";

const myIngSlice = createSlice({
    name: "myIng",
    initialState: notiInitialState,
    reducers: {
        setIngs: (state, action: PayloadAction<Ing[]>) => {
            const ings = action.payload ;
            state.isClosing = false;

            const today = new Date();
            const expDate = new Date();
            expDate.setDate(today.getDate() + 3);
    
            const filtered = ings.filter((item: Ing & { expDate?: string | Date }) => {
                if (!item.expDate) return false;
    
                const exp = new Date(item.expDate);
                return exp <= expDate;
            });
            state.ings = filtered;
        },
        startClosingAnimation: (state) => {
            state.isClosing = true;
        },
        setSettingsLoading: (state, action: PayloadAction<boolean>) => {
            state.isSettingsLoading = action.payload;
        },
        setSettingsError: (state, action: PayloadAction<string | null>) => {
            state.settingsError = action.payload;
        },
        setUserSettings: (state, action: PayloadAction<string>) => {
            state.userSettings = action.payload;
        },
        resetExpIngs: (state) => {
            state.ings = [];
            state.isClosing = true;
        }
    }
})

export const { 
    setIngs,
    startClosingAnimation,
    setSettingsLoading,
    setSettingsError,
    setUserSettings,
    resetExpIngs
 } = myIngSlice.actions;
export default myIngSlice.reducer;