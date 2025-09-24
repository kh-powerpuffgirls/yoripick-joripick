import { Client } from "@stomp/stompjs";

export type Message = {
  messageNo?: number;
  content: string;
  userNo: number;
  username: string;
  button?: {
    linkUrl: string;
  };
  createdAt: string;
  imageNo?: number;
};

export type Ing = {
  ingNo: number;
  ingName: string;
  quantity?: string;
}

type myIngAlertState = {
  content: Message;
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