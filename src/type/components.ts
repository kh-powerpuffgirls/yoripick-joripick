export interface AlertState {
    type: "admin" | "cclass" | "cservice" | null;
    visible: boolean;
}

export const initialState: AlertState = {
    type: null,
    visible: false,
}

export interface UseChatProps {
    roomId: string | number | undefined;
    myId: number | undefined;
}