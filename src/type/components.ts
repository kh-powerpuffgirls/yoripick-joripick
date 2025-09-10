import type { ChatRoomCreate, Message } from "./chatmodal";

export type AlertState = {
  type: ChatRoomCreate | null;
  visible: boolean;
}

export const initialState: AlertState = {
  type: null,
  visible: false,
}

export interface UserNotiSettings {
  newMessage: string;
  newReply: string;
  newReview: string;
  expiration: string;
}

export interface NotificationState {
  list: (Message & { id: string; isClosing?: boolean })[];
  userSettings: UserNotiSettings | null;
  isSettingsLoading: boolean;
  settingsError: string | null;
}

export const notiInitialState: NotificationState = {
  list: [],
  userSettings: null,
  isSettingsLoading: false,
  settingsError: null,
};