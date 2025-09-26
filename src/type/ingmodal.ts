import { Client } from "@stomp/stompjs";
import type { ReactNode } from "react";

export type Ing = {
  ingNo: number;
  ingName: string;
  quantity?: string;
  imageUrl?: string;
}

export const stompManager = {
  client: null as Client | null,
  subscriptions: new Map<string, any>(),
};

export interface NotificationState {
  ings?: Ing[];
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