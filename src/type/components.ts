import type { ChatRoomCreate } from "./chatmodal";

export type AlertState = {
    type: ChatRoomCreate | null;
    visible: boolean;
}

export const initialState: AlertState = {
    type: null,
    visible: false,
}

export type UseChatProps = {
    roomId: string | number | undefined;
    myId: number | undefined;
}
