import type { ReactNode } from "react";
import type { ChatRoomCreate, Message } from "./chatmodal";

export interface AlertState {
    htmlComponent: ReactNode;
    visible: boolean;
}

export const initialState: AlertState = {
    htmlComponent: null,
    visible: false,
};

export type ChatalertState = {
  type: ChatRoomCreate | null;
  visible: boolean;
}

export const chatInitialState: ChatalertState = {
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