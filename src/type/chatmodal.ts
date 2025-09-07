export type Message = {
  content: string;
  userNo: number;
  username: string;
  button?: {
    linkUrl: string;
  };
  createdAt?: string;
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

export type UseChatProps = {
    roomId: string | number | undefined;
    myId: number | undefined;
}