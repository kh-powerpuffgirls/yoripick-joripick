import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
    isOpen: boolean;
    modalType: 'newChallenge' | 'newAnnouncement' | null;
    initialData: {
        title: string;
    } | null;
}

const initialState: ModalState = {
    isOpen: false,
    modalType: null,
    initialData: null,
};

const adminModalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openNewChallengeModal: (state, action: PayloadAction<{ title: string; } | null>) => {
            state.isOpen = true;
            state.modalType = 'newChallenge';
            state.initialData = action.payload;
        },
        openNewAnnouncementModal: (state) => {
            state.isOpen = true;
            state.modalType = 'newAnnouncement';
        },
        closeModal: (state) => {
            state.isOpen = false;
            state.modalType = null;
            state.initialData = null;
        },
    },
});

export const { openNewChallengeModal, openNewAnnouncementModal, closeModal } = adminModalSlice.actions;

export default adminModalSlice.reducer;