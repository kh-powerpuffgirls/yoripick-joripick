import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
    totalReports: number;
}

const initialState: AdminState = {
    totalReports: 0,
};

const adminStateSlice = createSlice({
    name: 'adminState',
    initialState,
    reducers: {
        setTotalReports: (state, action: PayloadAction<number>) => {
            state.totalReports = action.payload;
        },
    },
});

export const { setTotalReports } = adminStateSlice.actions;

export default adminStateSlice.reducer;