import { createSlice } from '@reduxjs/toolkit';

const boardsSlice = createSlice({
    name: 'boards',
    initialState: {
        items: []
    },
    reducers: {
        // 상태 변경 로직을 추가
        // 예시: setBoards: (state, action) => { state.items = action.payload; }
    },
});

export default boardsSlice.reducer;