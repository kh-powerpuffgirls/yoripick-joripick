import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface BoardInfo {
    title: string;
    description: string;
}

interface BoardsState {
    items: BoardInfo[];
}

const initialState: BoardsState = {
    items: [],
};

const boardsSlice = createSlice({
    name: 'boards',
    initialState,
    reducers: {
        setBoards: (state, action: PayloadAction<BoardInfo[]>) => {
            state.items = action.payload;
        },
    },
});

export const { setBoards } = boardsSlice.actions;
export default boardsSlice.reducer;
