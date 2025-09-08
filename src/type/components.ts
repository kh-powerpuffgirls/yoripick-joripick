import type { ChatRoomCreate, Message } from "./chatmodal";

export type AlertState = {
    type: ChatRoomCreate | null;
    visible: boolean;
}

export const initialState: AlertState = {
    type: null,
    visible: false,
}

export interface NotificationState {
  list: (Message & { isClosing?: boolean })[];
}

export const notiInitialState: NotificationState = {
  list: [],
};