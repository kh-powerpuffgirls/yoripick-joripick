export interface AlertState {
    type: "chat" | "cservice" | null;
    visible: boolean;
}

export const initialState: AlertState = {
    type: null,
    visible: false,
}

export interface UseChatProps {
    roomId: string | undefined;
    myId: string;
}