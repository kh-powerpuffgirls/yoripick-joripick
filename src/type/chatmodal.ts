export type Message = {
  content: string;
  username: string;
  button?: {
    linkUrl: string;
  };
};

export type ChatRoom = {
  classNo: string | number;
  className: string;
  type: ChatRoomCreate;
  messages: Message[];
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
