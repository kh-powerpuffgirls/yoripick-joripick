import { Client } from "@stomp/stompjs";
import type { ReactNode } from "react";

export type Message = {
  content: string;
  imageNo?: number;
};

export type Ing = {
  ingNo: number;
  ingName: string;
  quantity?: string;
}

type myIngAlertState = {
  content?: Message;
  isChecked: boolean;
  ings: Ing[];
};

export const initialState: myIngAlertState = {
  isChecked: false,
  ings: []
};

export const stompManager = {
  client: null as Client | null,
  subscriptions: new Map<string, any>(),
};

export interface NotificationState {
  message?: Message;
  isClosing?: boolean;
  userSettings: string; // UserNotiSettings.expiration
  isSettingsLoading: boolean;
  settingsError: string | null;
}

export const notiInitialState: NotificationState = {
  userSettings: '',
  isSettingsLoading: false,
  settingsError: null,
};