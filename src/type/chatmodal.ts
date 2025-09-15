export type Message = {
  messageNo?: number;
  content: string;
  userNo: number;
  username: string;
  button?: {
    linkUrl: string;
  };
  createdAt: string;
  roomNo: number | string;
  imageNo?: number;
};

export type ChatRoom = {
  roomNo: string | number;
  className: string;
  type: ChatRoomCreate;
  messages: Message[];
  notification?: string;
};

export type ChatRoomCreate = "admin" | "cclass" | "cservice";

export interface ChatModalProps {
  type: ChatRoomCreate | null;
}

type ChatState = {
  isOpen: boolean;
  rooms: ChatRoom[];
  currentRoomId?: string | number;
};

export const initialState: ChatState = {
  isOpen: false,
  rooms: [],
  currentRoomId: undefined,
};